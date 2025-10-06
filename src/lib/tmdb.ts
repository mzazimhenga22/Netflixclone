
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
    return isSingleItem ? data : (data.results || []) as T[];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return isSingleItem ? (null as T) : [];
  }
}

export async function getTrending(): Promise<Movie[]> {
  return fetchFromTmdb<Movie>(`/trending/all/week?api_key=${API_KEY}&language=en-US`) as Promise<Movie[]>;
}

export async function getTrendingTvShows(): Promise<Movie[]> {
  return fetchFromTmdb<Movie>(`/trending/tv/day?api_key=${API_KEY}&language=en-US`) as Promise<Movie[]>;
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

export async function getMovieOrTvDetails(id: number): Promise<Movie | null> {
    const type = await getMediaType(id);
    if (!type) return null;
    return fetchFromTmdb<Movie>(`/${type}/${id}?api_key=${API_KEY}&language=en-US`, true) as Promise<Movie | null>;
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
