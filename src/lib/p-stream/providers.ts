
// src/providers.ts
import { makeStandardFetcher } from "./fetchers";
import { NotFoundError } from "./errors";
import type { Embed, Source, ScrapeMedia } from "./types";
import * as cheerio from "cheerio";

const vidsrcBase = "https://vidsrc.to";
const twoembedBase = "https://www.2embed.cc";
const superembedBase = "https://superembed.stream";

const vidsrcScraper: Source = {
  id: 'vidsrc',
  name: 'VidSrc',
  rank: 100,
  disabled: true, // Disabled due to consistent failures
  async fn(ops) {
    const media: ScrapeMedia = ops.media;

    let url: string;
    if (media.type === 'movie') {
      url = `${vidsrcBase}/embed/movie/${media.tmdbId}`;
    } else {
      url = `${vidsrcBase}/embed/tv/${media.tmdbId}/${media.seasonNumber}/${media.episodeNumber}`;
    }

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
          }
        }
      });
    }

    if (!streamUrl) {
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


const twoembedScraper: Source = {
  id: 'twoembed',
  name: '2Embed',
  rank: 100,
  disabled: false,
  async fn(ops: any) {
    const media: ScrapeMedia = ops.media;
    
    const embedUrl = media.type === 'movie'
      ? `${twoembedBase}/embed/movie?tmdb=${media.tmdbId}`
      : `${twoembedBase}/embed/tv?tmdb=${media.tmdbId}&s=${media.seasonNumber}&e=${media.episodeNumber}`;

    const embedPage = await ops.fetcher(embedUrl, {
      headers: {
        "Referer": embedUrl,
      }
    });

    const $ = cheerio.load(embedPage.body);
    const serverId = $('.server-item[data-id]').attr('data-id');

    if (!serverId) {
      throw new NotFoundError('Could not find player data-id on 2embed');
    }
    
    const ajaxUrl = `${twoembedBase}/ajax/embed/play?id=${serverId}&_token=2embed`; // token is static for now

    const { body: ajaxBody } = await ops.fetcher(ajaxUrl, {
        method: 'GET',
        headers: {
          "Referer": embedUrl,
          "X-Requested-With": "XMLHttpRequest",
        },
        responseType: 'json'
    });

    if (!ajaxBody?.url) {
        throw new NotFoundError('Failed to get player URL from 2embed API');
    }

    return {
        embeds: [{
            embedId: 'twoembed-player',
            url: ajaxBody.url
        }],
        stream: undefined
    };
  },
};

const vidsrcProScraper: Source = {
  id: 'vidsrcpro',
  name: 'VidSrc.pro',
  rank: 190,
  disabled: true, 
  async fn() { throw new Error('vidsrc.pro scraper is disabled'); }
};

const superembedScraper: Source = {
  id: 'superembed',
  name: 'SuperEmbed',
  rank: 90,
  disabled: false,
  async fn(ops: any) {
    const media = ops.media;
    const url = media.type === 'movie'
      ? `${superembedBase}/embed/movie?tmdb_id=${media.tmdbId}`
      : `${superembedBase}/embed/tv?tmdb_id=${media.tmdbId}&s=${media.seasonNumber}&e=${media.episodeNumber}`;
      
    return {
        embeds: [{
            embedId: 'superembed-player',
            url: url
        }],
        stream: undefined
    };
  }
};


// Embed Handlers
const twoembedPlayer: Embed = {
  id: "twoembed-player",
  name: "2Embed Player",
  async fn(ops: any) {
    const playerPage = await ops.fetcher(ops.url, {
        headers: {
            "Referer": twoembedBase
        }
    });

    const body = playerPage.body as string;
    const streamUrlMatch = body.match(/file:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/);

    if (!streamUrlMatch || !streamUrlMatch[1]) {
        throw new NotFoundError("Could not extract m3u8 file from 2embed player");
    }

    return {
        stream: {
            qualities: {
                auto: {
                    type: 'hls',
                    url: streamUrlMatch[1],
                },
            },
            captions: [],
        },
    };
  },
};

const superembedPlayer: Embed = {
    id: "superembed-player",
    name: "SuperEmbed Player",
    async fn(ops: any) {
        const playerPage = await ops.fetcher(ops.url, {
            headers: {
                "Referer": superembedBase
            }
        });

        const $ = cheerio.load(playerPage.body);
        const scriptWithData = $('script').filter((_, el) => {
            return $(el).html()?.includes('window.files') || false;
        });

        const scriptContent = scriptWithData.html();
        if (!scriptContent) {
            throw new NotFoundError("Could not find script with stream data in SuperEmbed player");
        }

        const urlMatch = scriptContent.match(/file:\s*'"(https?:\/\/[^"']+)"'/);
        if (!urlMatch || !urlMatch[1]) {
            throw new NotFoundError("Could not extract m3u8 file from SuperEmbed player");
        }

        return {
            stream: {
                qualities: {
                    auto: {
                        type: 'hls',
                        url: urlMatch[1],
                    },
                },
                captions: [],
            },
        };
    }
}


export const allSources: Source[] = [
    twoembedScraper,
    superembedScraper,
    vidsrcScraper,
    vidsrcProScraper,
].filter(s => !s.disabled);


export const allEmbeds: Embed[] = [
    twoembedPlayer,
    superembedPlayer
];
