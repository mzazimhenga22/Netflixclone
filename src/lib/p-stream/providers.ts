
"use client";

// All the providers are stored here
// A fetcher is a way to get a source, and a source is a place that can provide a stream
// This is a simplified version of how providers work, but it's good enough for our purposes

import {
    makeStandardFetcher,
    type Fetcher,
} from "./fetchers";

import {
    NotFoundError,
} from "./errors";

import type {
    Embed,
    Source,
} from "./types";

import {
    compareTitle,
} from "./utils/compare";


// VidSrc is a source that can provide streams
const vidsrcScraper: Source = {
    id: 'vidsrc',
    name: 'VidSrc',
    rank: 100,
    disabled: false,
    async fn(ops) {
        const fetcher = makeStandardFetcher(fetch);

        const finalUrl = `https://vidsrc.to/embed/${ops.media.type === 'movie' ? 'movie' : 'tv'}/${ops.media.tmdbId}${ops.media.type === 'tv' ? `/${ops.media.season.number}/${ops.media.episode.number}` : ''}`;

        const mainPage = await fetcher(finalUrl, {
            method: 'GET',
            headers: {
                Referer: 'https://vidsrc.to/',
            }
        });

        // This is a simplified way to get the stream URL, but it works for VidSrc
        const streamUrl = mainPage.body.match(/src: "([^"]+)"/)?.[1];

        if (!streamUrl) {
            throw new NotFoundError('Could not find stream URL');
        }

        return {
            embedId: 'vidsrc-embed',
            url: streamUrl,
        }
    }
};

// This is the embed that VidSrc uses
const vidsrcEmbed: Embed = {
    id: 'vidsrc-embed',
    name: 'VidSrc Embed',
    disabled: false,
    async fn(ops) {
        const streamUrl = ops.url;
        if (!streamUrl) {
            throw new NotFoundError('No stream URL found');
        }

        return {
            stream: {
                qualities: {
                    auto: {
                        type: 'hls',
                        url: streamUrl,
                    }
                },
                captions: [],
            }
        }
    }
};


export const allSources: Source[] = [
    vidsrcScraper,
];

export const allEmbeds: Embed[] = [
    vidsrcEmbed,
];
