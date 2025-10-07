
'use server';

import { makeProviders, makeStandardFetcher, targets, NotFoundError, type ScrapeMedia } from '@/lib/p-stream';
import type { Movie } from '@/types';
import type { Stream } from '@/lib/p-stream';
import * as pStreamProviders from './p-stream/providers';

const myFetcher = makeStandardFetcher(fetch);

const providers = makeProviders({
  fetcher: myFetcher,
  target: targets.NATIVE,
  sources: pStreamProviders.allSources,
  embeds: pStreamProviders.allEmbeds,
});

export async function getStream(media: Movie, season?: number, episode?: number): Promise<{ stream: Stream | null; error: string | null; }> {
  let lastError: Error | null = null;
  try {
    const tmdbId = media.id.toString();
    const releaseYear = new Date(media.release_date || media.first_air_date || '').getFullYear();
    const title = media.title || media.name || '';

    if (!media.media_type || !title || !releaseYear || !tmdbId) {
        const errorMsg = 'Invalid media object for stream lookup';
        console.error(`[STREAM] ${errorMsg}:`, media);
        return { stream: null, error: errorMsg };
    }

    let scrapeMedia: ScrapeMedia;

    if (media.media_type === 'movie') {
        scrapeMedia = {
            type: 'movie',
            title,
            releaseYear,
            tmdbId,
        };
    } else { 
        scrapeMedia = {
            type: 'tv',
            title,
            releaseYear,
            tmdbId,
            season: {
                number: season || 1,
                tmdbId: '', 
            },
            episode: {
                number: episode || 1,
                tmdbId: '', 
            },
        };
    }
    
    console.log(`[STREAM] Searching for stream for: ${title} (${releaseYear})`, scrapeMedia.type === 'tv' ? `S${scrapeMedia.season.number}E${scrapeMedia.episode.number}`: '');

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
      const errorMsg = `No stream found from any provider for: ${title}. ${lastError ? `Last error: ${lastError.message}`: ''}`;
      console.log(`[STREAM] ${errorMsg}`);
      return { stream: null, error: errorMsg };
    }
    
    console.log(`[STREAM] Stream found via source '${output.sourceId}' and embed '${output.embedId || 'none'}' for: ${title}`);

    return { stream: output.stream, error: null };

  } catch (err) {
    const error = err as Error;
    if (err instanceof NotFoundError) {
      console.warn(`[STREAM] Stream not found for ${media.title || media.name}:`, error.message);
    } else if (err instanceof Error) {
      console.error(`[STREAM] An unexpected error occurred while fetching the stream for ${media.title || media.name}:`, error);
    } else {
      console.error(`[STREAM] An unknown error occurred for ${media.title || media.name}:`, err);
    }
    return { stream: null, error: error.message || 'An unknown error occurred during scraping.' };
  }
}
