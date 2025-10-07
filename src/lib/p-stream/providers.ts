
'use server';

import { makeStandardFetcher } from "./fetchers";
import { NotFoundError } from "./errors";
import type { Embed, Source, ScrapeMedia } from "./types";
import * as cheerio from 'cheerio';

const vidsrcBase = 'https://vidsrc.to';
const vidsrcproBase = 'https://vidsrc.pro';

const vidsrcScraper: Source = {
    id: 'vidsrc',
    name: 'VidSrc',
    rank: 100,
    disabled: false,
    async fn(ops) {
      const media: ScrapeMedia = ops.media;
  
      let url: string;
      if (media.type === 'movie') {
        url = `${vidsrcBase}/embed/movie/${media.tmdbId}`;
      } else {
        url = `${vidsrcBase}/embed/tv/${media.tmdbId}/${media.season.number}/${media.episode.number}`;
      }
  
      // Use a realistic UA + referer (some sites block non-browser UA)
      const mainPage = await ops.fetcher(url, {
        method: 'GET',
        headers: {
          Referer: vidsrcBase + '/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
  
      const html = mainPage.body;
      const $ = cheerio.load(html);
  
      let streamUrl: string | null = null;
  
      const anyM3u8 = html.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
      if (anyM3u8) {
        streamUrl = anyM3u8[0];
      }
  
      const tryParseJsArray = (text: string) => {
        try {
          return new Function(`return ${text}`)();
        } catch (e) {
          return null;
        }
      };
  
      if (!streamUrl) {
        $('script').each((_, el) => {
          if (streamUrl) return false;
  
          const scriptContent = $(el).html() || '';
  
          const sourcesMatch = scriptContent.match(/sources\s*[:=]\s*(\[[\s\S]*?\])/i);
          if (sourcesMatch && sourcesMatch[1]) {
            const parsed = tryParseJsArray(sourcesMatch[1]);
            if (parsed && Array.isArray(parsed)) {
              const hls = parsed.find((s: any) => s.file && /(\.m3u8|\.m3u8\?)/i.test(s.file));
              if (hls && hls.file) {
                streamUrl = hls.file;
                return false;
              }
              const anyFile = parsed.find((s: any) => s.file);
              if (anyFile?.file) {
                streamUrl = anyFile.file;
                return false;
              }
            }
          }
  
          let playerSetupMatch = scriptContent.match(/Player\.setup\(([\s\S]*?)\)/i);
          if (!playerSetupMatch) {
            playerSetupMatch = scriptContent.match(/jwplayer\([^)]*\)\.setup\(([\s\S]*?)\)/i);
          }
          if (playerSetupMatch && playerSetupMatch[1]) {
            try {
              let cfg: any = null;
              try {
                cfg = JSON.parse(playerSetupMatch[1]);
              } catch {
                cfg = new Function(`return ${playerSetupMatch[1]}`)();
              }
              if (cfg) {
                if (cfg.file && /(\.m3u8|\.mp4)/i.test(cfg.file)) {
                  streamUrl = cfg.file;
                  return false;
                }
                if (Array.isArray(cfg.sources)) {
                  const s = cfg.sources.find((x: any) => x.file && /(\.m3u8)/i.test(x.file));
                  if (s?.file) {
                    streamUrl = s.file;
                    return false;
                  }
                }
              }
            } catch (e) {}
          }
  
          const atobMatch = scriptContent.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/i);
          if (atobMatch && atobMatch[1]) {
            try {
              const decoded = Buffer.from(atobMatch[1], 'base64').toString('utf8');
              const found = decoded.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
              if (found) {
                streamUrl = found[0];
                return false;
              }
            } catch (e) {}
          }
  
          const fileMatch = scriptContent.match(/["']file["']\s*:\s*["']([^"']+)["']/i);
          if (fileMatch && fileMatch[1]) {
            const candidate = fileMatch[1].replace(/\\\//g, '/');
            if (/^https?:\/\//i.test(candidate) && /\.m3u8/i.test(candidate)) {
              streamUrl = candidate;
              return false;
            }
          }
  
          const inlineM3u8 = scriptContent.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
          if (inlineM3u8) {
            streamUrl = inlineM3u8[0];
            return false;
          }
        });
      }
  
      if (!streamUrl) {
        const base64Matches = [...html.matchAll(/['"]([A-Za-z0-9+/=]{40,})['"]/g)];
        for (const m of base64Matches.slice(0, 8)) { 
          try {
            const maybe = Buffer.from(m[1], 'base64').toString('utf8');
            const found = maybe.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
            if (found) {
              streamUrl = found[0];
              break;
            }
          } catch (_) {}
        }
      }
  
      if (!streamUrl) {
        const snippetMatch = html.match(/(.{0,300}sources.{0,300})|(.{0,300}Player\.setup.{0,300})|(.{0,300}jwplayer.{0,300})/i);
        const debugSnippet = snippetMatch ? snippetMatch[0] : html.slice(0, 800);
        console.debug(`[vidsrcScraper] No stream URL found for ${url}. Debug snippet:`, debugSnippet);
        throw new NotFoundError(`Could not find stream URL in VidSrc page`);
      }
  
      return {
        embeds: [],
        stream: {
          qualities: {
            auto: {
              type: 'hls',
              url: streamUrl,
            },
          },
          captions: [],
        },
      };
    },
};

const vidsrcProScraper: Source = {
  id: 'vidsrcpro',
  name: 'VidSrc.pro',
  rank: 90, // Slightly lower rank than .to
  disabled: false,
  async fn(ops) {
    const media: ScrapeMedia = ops.media;
    let url: string;
    if (media.type === 'movie') {
      url = `${vidsrcproBase}/embed/${media.tmdbId}`;
    } else {
      url = `${vidsrcproBase}/embed/${media.tmdbId}/${media.season.number}-${media.episode.number}`;
    }
    const mainPage = await ops.fetcher(url, {
      method: 'GET',
      headers: {
        Referer: vidsrcproBase + '/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = mainPage.body;
    const $ = cheerio.load(html);
    let streamUrl: string | null = null;
    const anyM3u8 = html.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
    if (anyM3u8) {
      streamUrl = anyM3u8[0];
    }
    if (!streamUrl) {
      throw new NotFoundError('Could not find stream URL in VidSrc.pro page');
    }
    return {
      embeds: [],
      stream: {
        qualities: {
          auto: {
            type: 'hls',
            url: streamUrl,
          },
        },
        captions: [],
      },
    };
  },
};
  

export const allSources: Source[] = [
    vidsrcScraper,
    vidsrcProScraper
];

export const allEmbeds: Embed[] = [];
