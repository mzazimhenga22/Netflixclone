
'use server';

import { makeStandardFetcher, type ScrapeMedia } from '@/lib/p-stream';
import type { Movie } from '@/types';
import type { Stream } from '@/lib/p-stream';
import { makeProviders, makeSimpleProxyFetcher, targets } from './p-stream/providers';

const PROXY_URL = 'https://corsproxy.io';

const myFetcher = makeStandardFetcher(fetch);
const proxiedFetcher = makeSimpleProxyFetcher(PROXY_URL, fetch);

const providers = makeProviders({
  fetcher: myFetcher,
  proxiedFetcher: proxiedFetcher,
  target: targets.ANY,
});

export async function getStream(
  media: Movie,
  season?: number,
  episode?: number
): Promise<{ stream: Stream | null; error: string | null }> {
  let lastError: Error | null = null;

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
        ? { type: 'movie', title, releaseYear: releaseYear.toString(), tmdbId }
        : {
            type: 'show',
            title,
            releaseYear: releaseYear.toString(),
            tmdbId,
            season: { number: season || 1, tmdbId: '' },
            episode: { number: episode || 1, tmdbId: '' },
          };

    console.log(
      `[STREAM] Searching for stream for: ${title} (${releaseYear})`,
      scrapeMedia.type === 'show' ? `S${scrapeMedia.season.number}E${scrapeMedia.episode.number}` : ''
    );

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
        `[STREAM] An unexpected error occurred while fetching the stream for ${media.title || media.name}:`,
        err
      );
    } else {
      console.error(`[STREAM] An unknown error occurred for ${media.title || media.name}:`, err);
    }

    return { stream: null, error: message };
  }
}
