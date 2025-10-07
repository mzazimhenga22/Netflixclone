
'use server';

import { makeProviders, makeStandardFetcher, targets, NotFoundError, type ScrapeMedia } from '@/lib/p-stream';
import type { Movie } from '@/types';
import type { Stream } from '@/lib/p-stream';
import { allSources, allEmbeds } from './p-stream/providers';

// this is how the library will make http requests
const myFetcher = makeStandardFetcher(fetch);

// make an instance of the providers library
const providers = makeProviders({
  fetcher: myFetcher,
  target: targets.NATIVE,
  sources: allSources,
  embeds: allEmbeds,
});

export async function getStream(media: Movie, season?: number, episode?: number): Promise<Stream | null> {
  try {
    const tmdbId = media.id.toString();
    const releaseYear = new Date(media.release_date || media.first_air_date || '').getFullYear();
    const title = media.title || media.name || '';

    if (!media.media_type || !title || !releaseYear || !tmdbId) {
        console.error('[STREAM] Invalid media object for stream lookup:', media);
        throw new Error('Invalid media for stream lookup');
    }

    let scrapeMedia: ScrapeMedia;

    if (media.media_type === 'movie') {
        scrapeMedia = {
            type: 'movie',
            title,
            releaseYear,
            tmdbId,
        };
    } else { // media_type is 'tv'
        scrapeMedia = {
            type: 'tv',
            title,
            releaseYear,
            tmdbId,
            season: {
                number: season || 1,
                tmdbId: '', // Not strictly needed by most providers
            },
            episode: {
                number: episode || 1,
                tmdbId: '', // Not strictly needed by most providers
            },
        };
    }
    
    console.log(`[STREAM] Searching for stream for: ${title} (${releaseYear})`, scrapeMedia.type === 'tv' ? `S${scrapeMedia.season.number}E${scrapeMedia.episode.number}`: '');

    const output = await providers.runAll({
      media: scrapeMedia,
      events: {
        onError(err: Error) {
          console.error(`[STREAM] Error during runAll for ${title}:`, err.message);
        },
      }
    });

    if (!output) {
      console.log(`[STREAM] No stream found from any provider for: ${title}`);
      return null;
    }
    
    console.log(`[STREAM] Stream found via source '${output.sourceId}' and embed '${output.embedId}' for: ${title}`);
    console.log('[STREAM] Stream Details:', output.stream);

    return output.stream;

  } catch (err) {
    if (err instanceof NotFoundError) {
      console.warn(`[STREAM] Stream not found for ${media.title || media.name}:`, err.message);
    } else {
      console.error(`[STREAM] An unexpected error occurred while fetching the stream for ${media.title || media.name}:`, err);
    }
    return null;
  }
}
