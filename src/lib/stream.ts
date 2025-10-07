

'use server';

import { makeProviders, makeStandardFetcher, targets, NotFoundError } from '@/lib/p-stream';
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

export async function getStream(media: Movie) {
  try {
    const tmdbId = media.id.toString();
    const mediaType = media.media_type;
    const releaseYear = new Date(media.release_date || media.first_air_date || '').getFullYear();
    const title = media.title || media.name || '';

    if (!mediaType || !title || !releaseYear || !tmdbId) {
        throw new Error('Invalid media for stream lookup');
    }
    
    console.log(`Searching for stream for: ${title} (${releaseYear})`);

    const output = await providers.runAll({
      media: {
        type: mediaType,
        title,
        releaseYear,
        tmdbId
      },
    });

    if (!output) {
      console.log('No stream found from any provider.');
      return null;
    }
    
    console.log(`Stream found via ${output.sourceId}:`, output.stream);

    // For now, let's just return the first stream found
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
