
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
        
        // This is a more robust way to find the stream URL, looking for encoded data.
        $('script').each((_, el) => {
            const scriptContent = $(el).html();
            if (scriptContent?.includes('sources:')) {
                // Regex to find the sources array string
                const sourcesMatch = scriptContent.match(/sources:\s*(\[.*\])/);
                if (sourcesMatch && sourcesMatch[1]) {
                    try {
                        // The matched string is a JavaScript array, which can be parsed by a function constructor
                        const sources = new Function(`return ${sourcesMatch[1]}`)();
                        const hlsSource = sources.find((s: any) => s.file && s.file.endsWith('.m3u8'));
                        if (hlsSource && hlsSource.file) {
                            streamUrl = hlsSource.file;
                            return false; // exit .each loop
                        }
                    } catch (e) {
                        // The script might not be valid JS, so we ignore errors
                    }
                }
            }
            
            // Fallback for other encoding types, similar to other scrapers
            if (!streamUrl && scriptContent?.includes('Player.setup')) {
                const playerSetupMatch = scriptContent.match(/Player\.setup\((.*)\)/);
                 if (playerSetupMatch && playerSetupMatch[1]) {
                     try {
                        const setupConfig = JSON.parse(playerSetupMatch[1]);
                        if (setupConfig.file) {
                             streamUrl = setupConfig.file;
                             return false;
                        }
                        if (Array.isArray(setupConfig.sources) && setupConfig.sources[0]?.file) {
                            streamUrl = setupConfig.sources[0].file;
                            return false;
                        }
                     } catch(e) {
                         // ignore errors
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
