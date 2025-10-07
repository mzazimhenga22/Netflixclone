
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

        const mainPage = await ops.fetcher(url, {
            method: 'GET',
            headers: {
                Referer: vidsrcBase + '/',
            }
        });
        
        const $ = cheerio.load(mainPage.body);

        let streamUrl: string | null = null;
        
        $('script').each((_, el) => {
            const scriptContent = $(el).html();
            if (scriptContent && scriptContent.includes('sources:')) {
                const sourcesMatch = scriptContent.match(/sources: (\[.*?\])/);
                if (sourcesMatch && sourcesMatch[1]) {
                    try {
                        const sources = JSON.parse(sourcesMatch[1]);
                        const hlsSource = sources.find((s: any) => s.file && s.file.includes('.m3u8'));
                        if (hlsSource) {
                            streamUrl = hlsSource.file;
                            return false; // exit the loop
                        }
                    } catch (e) {
                        // ignore parsing errors
                    }
                }
            }
        });
        
        if (!streamUrl) {
            throw new NotFoundError('Could not find stream URL in VidSrc page');
        }

        return {
            embeds: [],
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

export const allEmbeds: Embed[] = [];
