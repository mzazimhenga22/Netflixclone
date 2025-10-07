

'use server';

import { makeProviders, makeStandardFetcher, targets, NotFoundError, type ScrapeMedia } from '@/lib/p-stream';
import type { Movie } from '@/types';
import type { Stream } from '@/lib/p-stream';

// this is how the library will make http requests
const myFetcher = makeStandardFetcher(fetch);

// make an instance of the providers library
const providers = makeProviders({
  fetcher: myFetcher,
  // will be played on a native video player
  target: targets.NATIVE
});

export async function getStream(media: Movie, season?: number, episode?: number): Promise<Stream | null> {
  try {
    const tmdbId = media.id.toString();
    const releaseYear = new Date(media.release_date || media.first_air_date || '').getFullYear();
    const title = media.title || media.name || '';

    if (!media.media_type || !title || !releaseYear || !tmdbId) {
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
    
    console.log(`Searching for stream for: ${title} (${releaseYear})`, scrapeMedia.type === 'tv' ? `S${scrapeMedia.season.number}E${scrapeMedia.episode.number}`: '');

    const output = await providers.runAll({
      media: scrapeMedia,
    });

    if (!output) {
      console.log('No stream found from any provider.');
      return null;
    }
    
    console.log(`Stream found via ${output.sourceId}:`, output.stream);

    return output.stream;

  } catch (err) {
    if (err instanceof NotFoundError) {
      console.warn(`Stream not found for ${media.title || media.name}:`, err.message);
    } else {
      console.error(`An unexpected error occurred while fetching the stream for ${media.title || media.name}:`, err);
    }
    return null;
  }
}
