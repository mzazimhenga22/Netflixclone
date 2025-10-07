// src/providers.ts
import { makeStandardFetcher } from "./fetchers";
import { NotFoundError } from "./errors";
import type { Embed, Source, ScrapeMedia } from "./types";
import * as cheerio from "cheerio";

const twoembedBase = "https://www.2embed.cc";

const twoembedScraper: Source = {
    id: 'twoembed',
    name: '2Embed',
    rank: 100,
    disabled: false,
    async fn(ops: any) {
        const media: ScrapeMedia = ops.media;
        
        // This provider uses a direct AJAX endpoint, which is more reliable than scraping HTML.
        const ajaxUrl = media.type === 'movie'
            ? `${twoembedBase}/ajax/embed/play?id=${media.tmdbId}&_token=...` // Token might be required, test without first.
            : `${twoembedBase}/ajax/embed/play?id=${media.tmdbId}&s=${media.season.number}&e=${media.episode.number}&_token=...`;

        const referer = media.type === 'movie'
            ? `${twoembedBase}/embed/movie?tmdb=${media.tmdbId}`
            : `${twoembedBase}/embed/tv?tmdb=${media.tmdbId}&s=${media.season.number}&e=${media.episode.number}`;

        const { body: ajaxBody } = await ops.fetcher(ajaxUrl, {
            headers: {
                "Referer": referer,
                "X-Requested-With": "XMLHttpRequest",
            },
            responseType: 'json'
        });

        if (!ajaxBody?.link) {
            throw new NotFoundError('Failed to get player URL from 2embed API');
        }

        return {
            embeds: [{
                embedId: 'twoembed-player',
                url: ajaxBody.link
            }],
            stream: undefined
        };
    },
};


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


// Other scrapers are disabled as they are currently unreliable.
const vidsrcScraper: Source = {
  id: 'vidsrc',
  name: 'VidSrc',
  rank: 200,
  disabled: true,
  async fn() { throw new Error('vidsrc scraper is disabled'); }
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
  rank: 180,
  disabled: true,
  async fn() { throw new Error('superembed scraper is disabled'); }
};

export const allSources: Source[] = [
    twoembedScraper,
    vidsrcScraper,
    vidsrcProScraper,
    superembedScraper,
].filter(s => !s.disabled);


export const allEmbeds: Embed[] = [
    twoembedPlayer
];
