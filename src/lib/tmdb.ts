
import type { Movie } from '@/types';

const API_KEY = '1ba41bda48d0f1c90954f4811637b6d6';
const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

async function fetchFromTmdb<T>(endpoint: string, isSingleItem = false): Promise<T | T[]> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
      console.error(`Failed to fetch from ${endpoint}:`, res.status, res.statusText);
      const errorBody = await res.text();
      console.error("Error body:", errorBody);
      return isSingleItem ? (null as T) : [];
    }
    const data = await res.json();
    // For lists, the results are in a 'results' property. For single items, it's the root object.
    if (isSingleItem) {
      return data;
    }
    return (data.results || []) as T[];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return isSingleItem ? (null as T) : [];
  }
}

export async function getTrending(): Promise<Movie[]> {
  return fetchFromTmdb<Movie>(`/trending/all/week?api_key=${API_KEY}&language=en-US`) as Promise<Movie[]>;
}

export async function getTrendingTvShows(region: string = 'US'): Promise<Movie[]> {
  return fetchFromTmdb<Movie>(`/trending/tv/day?api_key=${API_KEY}&language=en-US&region=${region}`) as Promise<Movie[]>;
}

export async function getPopularMovies(): Promise<Movie[]> {
    return fetchFromTmdb<Movie>(`/movie/popular?api_key=${API_KEY}&language=en-US&page=1`) as Promise<Movie[]>;
}

export async function getPopularTvShows(): Promise<Movie[]> {
    return fetchFromTmdb<Movie>(`/tv/popular?api_key=${API_KEY}&language=en-US&page=1`) as Promise<Movie[]>;
}

export async function getMoviesByGenre(genreId: number): Promise<Movie[]> {
    return fetchFromTmdb<Movie>(`/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=1`) as Promise<Movie[]>;
}

export async function getTvShowsByGenre(genreId: number): Promise<Movie[]> {
    return fetchFromTmdb<Movie>(`/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=1`) as Promise<Movie[]>;
}

export async function getSimilar(id: number, mediaType: 'movie' | 'tv' | undefined): Promise<Movie[]> {
  const type = mediaType || (await getMediaType(id));
  if (!type) return [];
  return fetchFromTmdb<Movie>(`/${type}/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`) as Promise<Movie[]>;
}

async function getCertification(id: number, mediaType: 'movie' | 'tv'): Promise<string | undefined> {
    try {
        let endpoint = '';
        if (mediaType === 'movie') {
            endpoint = `/movie/${id}/release_dates?api_key=${API_KEY}`;
        } else {
            endpoint = `/tv/${id}/content_ratings?api_key=${API_KEY}`;
        }

        const data = await fetchFromTmdb<any>(endpoint, true);
        if (!data || !data.results) return undefined;

        if (mediaType === 'movie') {
            const usRelease = data.results.find((r: any) => r.iso_3166_1 === 'US');
            return usRelease?.release_dates[0]?.certification || undefined;
        } else {
            const usRating = data.results.find((r: any) => r.iso_3166_1 === 'US');
            return usRating?.rating || undefined;
        }
    } catch (error) {
        console.error(`Failed to fetch certification for ${mediaType} ${id}:`, error);
        return undefined;
    }
}


export async function getMovieOrTvDetails(id: number, mediaType?: 'movie' | 'tv'): Promise<Movie | null> {
    const type = mediaType || await getMediaType(id);
    if (!type) return null;
    const details = await fetchFromTmdb<Movie>(`/${type}/${id}?api_key=${API_KEY}&language=en-US`, true) as Movie | null;
    if (details) {
        details.media_type = type; // Ensure media_type is set
        details.certification = await getCertification(id, type);
    }
    return details;
}


// Helper to determine media type if not provided (less efficient)
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
