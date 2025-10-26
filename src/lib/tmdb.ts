import type { Movie } from '@/types';

const API_KEY = '1ba41bda48d0f1c90954f4811637b6d6';
const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

// --- Simple in-memory cache ---
const cache = new Map<string, any>();

// --- Global request queue to prevent 429s ---
const MAX_CONCURRENT = 5;
let activeRequests = 0;
const queue: (() => void)[] = [];

function enqueueRequest(fn: () => Promise<any>) {
  return new Promise<any>((resolve, reject) => {
    const run = async () => {
      activeRequests++;
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        activeRequests--;
        if (queue.length > 0) queue.shift()?.();
      }
    };

    if (activeRequests < MAX_CONCURRENT) {
      run();
    } else {
      queue.push(run);
    }
  });
}

// --- Core fetch helper with retry & cache ---
async function fetchFromTmdb<T>(
  endpoint: string,
  isSingleItem = false,
  attempt = 1
): Promise<T | T[] | null> {
  const url = `${BASE_URL}${endpoint}`;
  const cacheKey = `${url}-${isSingleItem}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  return enqueueRequest(async () => {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.min(2000 * attempt, 10000);
        console.warn(`⚠️ TMDB rate limit hit. Retrying in ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
        return fetchFromTmdb<T>(endpoint, isSingleItem, attempt + 1);
      }

      if (!res.ok) {
        console.error(`Failed to fetch from ${endpoint}:`, res.status, res.statusText);
        const errorBody = await res.text();
        console.error('Error body:', errorBody);
        return isSingleItem ? (null as T) : ([] as T[]);
      }

      const data = await res.json();
      const result = isSingleItem ? (data as T) : ((data.results || []) as T[]);
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return isSingleItem ? (null as T) : ([] as T[]);
    }
  });
}

/** Normalize a fetch result (which may be T, T[] or null) into T[] when we expect a list */
function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const maybeResults = (value as any)?.results;
  if (Array.isArray(maybeResults)) return maybeResults as T[];
  return [value as T];
}

// --- API Wrappers ---
export async function searchMulti(query: string): Promise<Movie[]> {
  const raw = await fetchFromTmdb<Movie>(
    `/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
  );
  return ensureArray<Movie>(raw).filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );
}

export async function getTrending(): Promise<Movie[]> {
  const raw = await fetchFromTmdb<Movie>(`/trending/all/week?api_key=${API_KEY}&language=en-US`);
  return ensureArray<Movie>(raw);
}

export async function getTrendingTvShows(region: string = 'US'): Promise<Movie[]> {
  const raw = await fetchFromTmdb<Movie>(
    `/trending/tv/day?api_key=${API_KEY}&language=en-US&region=${region}`
  );
  return ensureArray<Movie>(raw);
}

export async function getPopularMovies(): Promise<Movie[]> {
  const raw = await fetchFromTmdb<Movie>(`/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
  return ensureArray<Movie>(raw);
}

export async function getPopularTvShows(): Promise<Movie[]> {
  const raw = await fetchFromTmdb<Movie>(`/tv/popular?api_key=${API_KEY}&language=en-US&page=1`);
  return ensureArray<Movie>(raw);
}

export async function getMoviesByGenre(genreId: number, count: number = 20): Promise<Movie[]> {
  const pagesToFetch = Math.ceil(count / 20);
  const results: Movie[] = [];

  for (let i = 1; i <= pagesToFetch; i++) {
    const page = await fetchFromTmdb<Movie>(
      `/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=${i}`
    );
    results.push(...ensureArray<Movie>(page));
    await new Promise((r) => setTimeout(r, 200)); // Throttle between pages
  }

  return results.slice(0, count);
}

export async function getTvShowsByGenre(genreId: number, count: number = 20): Promise<Movie[]> {
  const pagesToFetch = Math.ceil(count / 20);
  const results: Movie[] = [];

  for (let i = 1; i <= pagesToFetch; i++) {
    const page = await fetchFromTmdb<Movie>(
      `/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=${i}`
    );
    results.push(...ensureArray<Movie>(page));
    await new Promise((r) => setTimeout(r, 200));
  }

  return results.slice(0, count);
}

export async function getSimilar(
  id: number,
  mediaType: 'movie' | 'tv' | undefined
): Promise<Movie[]> {
  const type = mediaType || (await getMediaType(id));
  if (!type) return [];
  const raw = await fetchFromTmdb<Movie>(
    `/${type}/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`
  );
  return ensureArray<Movie>(raw);
}

async function getCertification(id: number, mediaType: 'movie' | 'tv'): Promise<string | undefined> {
  try {
    const endpoint =
      mediaType === 'movie'
        ? `/movie/${id}/release_dates?api_key=${API_KEY}`
        : `/tv/${id}/content_ratings?api_key=${API_KEY}`;

    const data = await fetchFromTmdb<any>(endpoint, true);
    if (!data || !data.results) return undefined;

    if (mediaType === 'movie') {
      const usRelease = data.results.find((r: any) => r.iso_3166_1 === 'US');
      return usRelease?.release_dates?.[0]?.certification || undefined;
    } else {
      const usRating = data.results.find((r: any) => r.iso_3166_1 === 'US');
      return usRating?.rating || undefined;
    }
  } catch (error) {
    console.error(`Failed to fetch certification for ${mediaType} ${id}:`, error);
    return undefined;
  }
}

export async function getMovieOrTvDetails(
  id: number,
  mediaType?: 'movie' | 'tv'
): Promise<Movie | null> {
  const type = mediaType || (await getMediaType(id));
  if (!type) return null;

  const details = (await fetchFromTmdb<Movie>(
    `/${type}/${id}?api_key=${API_KEY}&language=en-US`,
    true
  )) as Movie | null;

  if (details) {
    details.media_type = type;
    details.certification = await getCertification(id, type);
  }

  return details;
}

async function getMediaType(id: number): Promise<'movie' | 'tv' | null> {
  try {
    let res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    if (res.ok) return 'movie';
    res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
    if (res.ok) return 'tv';
    return null;
  } catch {
    return null;
  }
}
