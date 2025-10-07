
'use server';

import { makeProviders, makeStandardFetcher, makeSimpleProxyFetcher, targets, type ScrapeMedia, type Stream } from '../../providers/src/index';
import type { Movie } from '@/types';

// The proxy is used as a fallback for scrapers that might need it.
const PROXY_URL = 'https://corsproxy.io';

const myFetcher = makeStandardFetcher(fetch);
const proxiedFetcher = makeSimpleProxyFetcher(PROXY_URL, fetch);

// Initialize the providers library with both a standard and a proxied fetcher.
// This gives scrapers the flexibility to choose the best request method.
const providers = makeProviders({
  fetcher: myFetcher,
  proxiedFetcher: proxiedFetcher,
  target: targets.ANY, // Request all available stream types
  consistentIpForRequests: false,
});

export async function getStream(
  media: Movie,
  season?: number,
  episode?: number
): Promise<{ stream: Stream | null; error: string | null }> {
  let lastError: Error | null = null;
  const title = (media.title || media.name || '') as string;

  try {
    const tmdbId = String(media.id || "");
    const releaseYear = new Date(media.release_date || media.first_air_date || '').getFullYear();

    if (!media.media_type || !title || !releaseYear || !tmdbId) {
      const errorMsg = 'Invalid media object for stream lookup';
      console.error(`[STREAM] ${errorMsg}:`, media);
      return { stream: null, error: errorMsg };
    }
    
    // Construct the media object for the scraper
    const scrapeMedia: ScrapeMedia =
      media.media_type === 'movie'
        ? { type: 'movie', title, releaseYear, tmdbId, imdbId: media.imdb_id }
        : {
            type: 'show',
            title,
            releaseYear,
            tmdbId,
            imdbId: media.imdb_id,
            season: { number: season || 1, tmdbId: '' }, // The scraper library doesn't need season/episode tmdbId
            episode: { number: episode || 1, tmdbId: '' },
          };

    console.log(
      `[STREAM] Searching for stream for: ${title} (${releaseYear})`,
      scrapeMedia.type === 'show' ? `S${scrapeMedia.season.number}E${scrapeMedia.episode.number}` : ''
    );

    // Run all configured providers until a stream is found
    const output = await providers.runAll({
      media: scrapeMedia,
      events: {
        onError(err: Error) {
          lastError = err;
          console.error(`[STREAM] Provider error for ${title}:`, err.message);
        },
      }
    });

    if (!output || !output.stream) {
      const lastErrorMsg = lastError ? ` Last error: ${lastError.message}` : '';
      const errorMsg = `No stream found from any provider for: ${title}.${lastErrorMsg}`;
      console.log(`[STREAM] ${errorMsg}`);
      return { stream: null, error: errorMsg };
    }

    console.log(
      `[STREAM] Stream found via source '${output.sourceId}'${output.embedId ? ` (embed '${output.embedId}')` : ''} for: ${title}`
    );

    return { stream: output.stream as Stream, error: null };
    
  } catch (err: unknown) {
    let message = 'An unknown error occurred during scraping.';
    if (err instanceof Error) {
      message = err.message;
      console.error(
        `[STREAM] An unexpected error occurred while fetching the stream for ${title}:`,
        err
      );
    } else {
      console.error(`[STREAM] An unknown error occurred for ${title}:`, err);
    }

    return { stream: null, error: message };
  }
}
