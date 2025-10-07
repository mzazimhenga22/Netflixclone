
'use server';

import { makeProviders, makeStandardFetcher, targets, NotFoundError, type ScrapeMedia } from '@/lib/p-stream';
import type { Movie } from '@/types';
import type { Stream } from '@/lib/p-stream';
import * as pStreamProviders from './p-stream/providers';

const myFetcher = makeStandardFetcher(fetch);

const target = targets.BROWSER;

const providers = makeProviders({
  fetcher: myFetcher,
  target,
  sources: pStreamProviders.allSources,
  embeds: pStreamProviders.allEmbeds,
} as any);

export async function getStream(
  media: Movie,
  season?: number,
  episode?: number
): Promise<{ stream: Stream | null; error: string | null }> {
  
  try {
    const tmdbId = String(media.id || "");
    const releaseYear = new Date(media.release_date || media.first_air_date || '').getFullYear();
    const title = (media.title || media.name || '') as string;

    if (!media.media_type || !title || !releaseYear || !tmdbId) {
      const errorMsg = 'Invalid media object for stream lookup';
      console.error(`[STREAM] ${errorMsg}:`, media);
      return { stream: null, error: errorMsg };
    }

    const scrapeMedia: ScrapeMedia =
      media.media_type === 'movie'
        ? {
            type: 'movie',
            title,
            releaseYear,
            tmdbId,
          }
        : {
            type: 'show',
            title,
            releaseYear,
            tmdbId,
            season: {
              number: season || 1,
              tmdbId: '', // Not all providers need season TMDB ID
            },
            episode: {
              number: episode || 1,
              tmdbId: '', // Not all providers need episode TMDB ID
            },
          };

    console.log(
      `[STREAM] Searching for stream for: ${title} (${releaseYear})`,
      scrapeMedia.type === 'show' ? `S${scrapeMedia.season.number}E${scrapeMedia.episode.number}` : ''
    );

    let lastError: Error | null = null;
    const output = await providers.runAll({ 
        media: scrapeMedia,
        events: {
             onError(err: Error) {
                 lastError = err;
                 console.error(`[STREAM] Provider error for ${title}:`, err.message);
             },
        }
    });

    if (output?.stream) {
      console.log(`[STREAM] Success! Found stream for ${title} from source ${output.sourceId}`);
      return { stream: output.stream, error: null };
    }

    const errorMsg = lastError?.message || `No stream found from any provider for: ${title}.`;
    console.log(`[STREAM] ${errorMsg}`);
    return { stream: null, error: errorMsg };

  } catch (err: unknown) {
    let message = 'An unknown error occurred during scraping.';
    if (err instanceof NotFoundError) {
      message = err.message;
      console.warn(`[STREAM] Stream not found for ${media.title || media.name}:`, message);
    } else if (err instanceof Error) {
      message = err.message;
      console.error(
        `[STREAM] An unexpected error occurred while fetching the stream for ${media.title || media.name}:`,
        err
      );
    }
    
    return { stream: null, error: message };
  }
}
