
import { makeStandardFetcher } from "./fetchers";
import { NotFoundError } from "./errors";
import type { Embed, Source, ScrapeMedia } from "./types";

const vidsrcBase = 'https://vidsrc.to';

const vidsrcScraper: Source = {
    id: 'vidsrc',
    name: 'VidSrc',
    rank: 100,
    disabled: false,
    async fn(ops) {
        const fetcher = makeStandardFetcher(fetch);
        
        const media: ScrapeMedia = ops.media;

        let url: string;
        if (media.type === 'movie') {
            url = `${vidsrcBase}/embed/movie/${media.tmdbId}`;
        } else {
            url = `${vidsrcBase}/embed/tv/${media.tmdbId}/${media.season.number}/${media.episode.number}`;
        }

        const mainPage = await fetcher(url, {
            method: 'GET',
            headers: {
                Referer: vidsrcBase + '/',
            }
        });
        
        // More robust way to find the stream URL, looking for a sources array in a script tag
        const streamSrcMatch = mainPage.body.match(/sources:\s*\[[\s\S]*?\{[\s\S]*?file:\s*["']([^"']+)["']/i);
        const streamUrl = streamSrcMatch ? streamSrcMatch[1] : null;

        if (!streamUrl) {
            throw new NotFoundError('Could not find stream URL in VidSrc page');
        }

        return {
            embeds: [{
                embedId: 'vidsrc-embed',
                url: streamUrl,
            }],
        }
    }
};

const vidsrcEmbed: Embed = {
    id: 'vidsrc-embed',
    name: 'VidSrc Embed',
    disabled: false,
    async fn(ops) {
        const streamUrl = ops.url;
        if (!streamUrl) {
            throw new NotFoundError('No stream URL found in VidSrc embed operations');
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
