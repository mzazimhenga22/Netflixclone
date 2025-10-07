
'use client';

import { makeStandardFetcher } from "./fetchers";
import { NotFoundError } from "./errors";
import type { Embed, Source, ScrapeMedia } from "./types";
import * as cheerio from 'cheerio';

const vidsrcBase = 'https://vidsrc.to';

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
        // ensure your fetcher follows redirects and keeps cookies if configured
      });
  
      const html = mainPage.body;
      const $ = cheerio.load(html);
  
      let streamUrl: string | null = null;
  
      // 1) Fast & simple: any direct .m3u8 URL in the HTML
      const anyM3u8 = html.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
      if (anyM3u8) {
        streamUrl = anyM3u8[0];
      }
  
      // Helper: try parsing JS array text safely
      const tryParseJsArray = (text: string) => {
        try {
          // Use Function instead of JSON.parse because strings may use single quotes or unquoted keys.
          return new Function(`return ${text}`)();
        } catch (e) {
          return null;
        }
      };
  
      // 2) Inspect <script> blocks for common patterns
      if (!streamUrl) {
        $('script').each((_, el) => {
          if (streamUrl) return false; // break
  
          const scriptContent = $(el).html() || '';
  
          // A) sources: [ ... ] pattern (many players)
          const sourcesMatch = scriptContent.match(/sources\s*[:=]\s*(\[[\s\S]*?\])/i);
          if (sourcesMatch && sourcesMatch[1]) {
            const parsed = tryParseJsArray(sourcesMatch[1]);
            if (parsed && Array.isArray(parsed)) {
              const hls = parsed.find((s: any) => s.file && /(\.m3u8|\.m3u8\?)/i.test(s.file));
              if (hls && hls.file) {
                streamUrl = hls.file;
                return false;
              }
              // fallback: first file
              const anyFile = parsed.find((s: any) => s.file);
              if (anyFile?.file) {
                streamUrl = anyFile.file;
                return false;
              }
            }
          }
  
          // B) Player.setup(...) or jwplayer(...).setup(...)
          let playerSetupMatch = scriptContent.match(/Player\.setup\(([\s\S]*?)\)/i);
          if (!playerSetupMatch) {
            playerSetupMatch = scriptContent.match(/jwplayer\([^)]*\)\.setup\(([\s\S]*?)\)/i);
          }
          if (playerSetupMatch && playerSetupMatch[1]) {
            try {
              // sometimes it's JSON-like, sometimes JS. Try JSON.parse then fallback to Function.
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
            } catch (e) {
              // ignore parse errors
            }
          }
  
          // C) Look for atob('base64') patterns - decode and search for m3u8 within
          const atobMatch = scriptContent.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/i);
          if (atobMatch && atobMatch[1]) {
            try {
              const decoded = Buffer.from(atobMatch[1], 'base64').toString('utf8');
              const found = decoded.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
              if (found) {
                streamUrl = found[0];
                return false;
              }
            } catch (e) {
              // ignore decode errors
            }
          }
  
          // D) Some pages store an encoded string like "file":"\/getstream\/abc...". Check file: occurrences
          const fileMatch = scriptContent.match(/["']file["']\s*:\s*["']([^"']+)["']/i);
          if (fileMatch && fileMatch[1]) {
            const candidate = fileMatch[1].replace(/\\\//g, '/');
            if (/^https?:\/\//i.test(candidate) && /\.m3u8/i.test(candidate)) {
              streamUrl = candidate;
              return false;
            }
          }
  
          // E) direct .m3u8 inside script
          const inlineM3u8 = scriptContent.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
          if (inlineM3u8) {
            streamUrl = inlineM3u8[0];
            return false;
          }
        });
      }
  
      // 3) If still not found, try searching the whole HTML for encoded base64 blocks and decode them
      if (!streamUrl) {
        const base64Matches = [...html.matchAll(/['"]([A-Za-z0-9+/=]{40,})['"]/g)];
        for (const m of base64Matches.slice(0, 8)) { // only try a few so we don't waste CPU
          try {
            const maybe = Buffer.from(m[1], 'base64').toString('utf8');
            const found = maybe.match(/https?:\/\/[^'"\s>]+\.m3u8(?:\?[^'"\s>]*)?/i);
            if (found) {
              streamUrl = found[0];
              break;
            }
          } catch (_) {
            // ignore
          }
        }
      }
  
      // 4) Final fallback: fail but include short debugging snippet
      if (!streamUrl) {
        // Keep snippet short to avoid huge logs; include where "sources" or "Player.setup" appears
        const snippetMatch = html.match(/(.{0,300}sources.{0,300})|(.{0,300}Player\.setup.{0,300})|(.{0,300}jwplayer.{0,300})/i);
        const debugSnippet = snippetMatch ? snippetMatch[0] : html.slice(0, 800);
        // helpful log for debugging in dev
        // eslint-disable-next-line no-console
        console.debug(`[vidsrcScraper] No stream URL found for ${url}. Debug snippet:`, debugSnippet);
        throw new NotFoundError(`Could not find stream URL in VidSrc page (debug snippet included). Snippet: ${debugSnippet}`);
      }
  
      // At this point we have a stream URL
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
];

export const allEmbeds: Embed[] = [];
