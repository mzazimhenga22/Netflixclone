// src/providers.ts
import { makeStandardFetcher } from "./fetchers";
import { NotFoundError } from "./errors";
import type { Embed, Source, ScrapeMedia } from "./types";
import * as cheerio from "cheerio";

// ========== makeSimpleProxyFetcher ==========
function makeSimpleProxyFetcher(proxyUrl: string, fetchApi: typeof fetch): any {
    if (!proxyUrl) throw new Error("proxyUrl required");
    const base = proxyUrl.replace(/\/$/, "");
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<any> => {
        let targetUrl: string;
        if (typeof input === 'string') targetUrl = input;
        else if (input instanceof URL) targetUrl = input.toString();
        else if ((input as any).url) targetUrl = (input as any).url;
        else targetUrl = String(input);

        // Use a simpler proxy URL format
        const proxiedUrl = `${base}/${targetUrl}`;

        const upstreamInit: RequestInit = {
            method: init?.method || "GET",
            headers: init?.headers ? init.headers : undefined,
            redirect: (init as any)?.redirect || "follow",
            body: init && (init as any).body ? (init as any).body : undefined,
        };

        return fetchApi(proxiedUrl, upstreamInit);
    };
}


/* ===== local constants & scrapers (unchanged logic) ===== */
const vidsrcBase = "https://vidsrc.to";
const vidsrcproBase = "https://vidsrc.pro";
const twoembedBase = "https://www.2embed.cc";


/* --------- Local scrapers (defensive) ---------- */
const twoembedScraper: Source = {
  id: "twoembed",
  name: "2Embed",
  rank: 110,
  disabled: false,
  async fn(ops: any) {
    const media: ScrapeMedia = ops.media;
    const referer = media.type === 'movie'
        ? `${twoembedBase}/embed/movie?tmdb=${media.tmdbId}`
        : `${twoembedBase}/embed/tv?tmdb=${media.tmdbId}&s=${media.season.number}&e=${media.episode.number}`;

    const embedPage = await ops.fetcher(referer, {
      method: "GET",
      headers: { Referer: twoembedBase, "User-Agent": "Mozilla/5.0" },
    });
    const embedHtml = embedPage.body as string;
    const $ = cheerio.load(embedHtml);
    const playerId = $(".play-btn[data-id]").attr("data-id");

    if (!playerId) {
      throw new Error("Could not find player ID on 2embed");
    }

    const playerUrl = await ops.fetcher(`${twoembedBase}/ajax/embed/play`, {
        method: 'POST',
        body: { id: playerId },
        bodyType: 'form',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: referer,
        }
    });
    
    const url = (playerUrl.body as { link: string }).link;
    
    return {
      embeds: [{ embedId: "twoembed-player", url: url }],
      stream: undefined,
    };
  },
};

/* ===================== local embed players ===================== */
const twoembedPlayer: Embed = {
  id: "twoembed-player",
  name: "2Embed Player",
  async fn(ops: any) {
    let playerUrl = String(ops.url);
    try { playerUrl = new URL(String(ops.url), twoembedBase).href; } catch {}
    const iframePage = await ops.fetcher(playerUrl, { method: "GET", headers: { Referer: twoembedBase } });
    const body = iframePage.body as string;
    const m3u8 = body.match(/file:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)/) || body.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
    if (!m3u8 || !m3u8[1]) {
      throw new NotFoundError("Could not find m3u8 file in 2Embed player");
    }
    return { stream: { qualities: { auto: { type: "hls", url: m3u8[1] } }, captions: [] } };
  },
};

/* ===== merge external + local lists ===== */
const localSources: Source[] = [twoembedScraper];
const localEmbeds: Embed[] = [twoembedPlayer];

const mergedSources: Source[] = [...localSources].filter(Boolean);
mergedSources.sort((a, b) => (a.rank ?? 100) - (b.rank ?? 100));

const mergedEmbeds: Embed[] = [...localEmbeds].filter(Boolean);

/* ===== targets enum-like ===== */
export const targets = {
  ANY: "any",
  HLS: "hls",
  FILE: "file",
};


/* ===== main factory: makeProviders ===== */
export function makeProviders(opts: { fetcher: any; proxiedFetcher?: any; target?: string } = { fetcher: (globalThis as any).fetch }) {
  const defaultFetcher = opts.fetcher ?? (globalThis as any).fetch;
  const proxied = opts.proxiedFetcher;

  function _preferredFetcher() {
    return proxied || defaultFetcher;
  }

  async function runAll({ media, events }: { media: ScrapeMedia, events: any }) {
    for (const source of mergedSources) {
      if (source.disabled) continue;
      try {
        const output = await source.fn({
          fetcher: _preferredFetcher(),
          proxiedFetcher: proxied,
          media,
          target: opts.target || targets.ANY,
          consistentIpForRequests: !!proxied,
          events,
        });

        if (output.stream) return { sourceId: source.id, embedId: null, stream: output.stream };

        for (const embed of output.embeds) {
          const embedRunner = mergedEmbeds.find(e => e.id === embed.embedId);
          if (!embedRunner || embedRunner.disabled) continue;

          const embedOutput = await embedRunner.fn({
            fetcher: _preferredFetcher(),
            proxiedFetcher: proxied,
            media,
            target: opts.target || targets.ANY,
            url: embed.url,
            consistentIpForRequests: !!proxied,
            events,
          });

          if (embedOutput.stream) return { sourceId: source.id, embedId: embedRunner.id, stream: embedOutput.stream };
        }
      } catch (err: any) {
        events?.onError?.(err);
      }
    }
    return null;
  }

  return {
    runAll,
    listSources: () => mergedSources,
    runSourceScraper: async ({ id, media }: { id: string; media: ScrapeMedia }) => {
      const source = mergedSources.find(s => s.id === id);
      if (!source) throw new Error(`Unknown source: ${id}`);
      return source.fn({ fetcher: _preferredFetcher(), proxiedFetcher: proxied, media } as any);
    },
    runEmbedScraper: async ({ id, url }: { id: string; url: string }) => {
      const embed = mergedEmbeds.find(e => e.id === id);
      if (!embed) throw new Error(`Unknown embed: ${id}`);
      return embed.fn({ fetcher: _preferredFetcher(), proxiedFetcher: proxied, url } as any);
    },
    allSources: mergedSources,
    allEmbeds: mergedEmbeds,
  };
}


/* re-export makeStandardFetcher from local fetchers module (server expects this) */
export { makeStandardFetcher, makeSimpleProxyFetcher };

/* optional exports for direct use */
export const allSources = mergedSources;
export const allEmbeds = mergedEmbeds;
export default { makeProviders, makeStandardFetcher, targets };
