
import type { Movie } from '@/types';

const API_KEY = '1ba41bda48d0f1c90954f4811637b6d6';
const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

async function fetchFromTmdb<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
      console.error(`Failed to fetch from ${endpoint}:`, res.statusText);
      return [];
    }
    const data = await res.json();
    return data.results as T[];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}

export async function getTrendingMovies(): Promise<Movie[]> {
  return fetchFromTmdb<Movie>(`/trending/all/week?api_key=${API_KEY}&language=en-US`);
}

export async function getPopularMovies(): Promise<Movie[]> {
    return fetchFromTmdb<Movie>(`/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
}

export async function getMoviesByGenre(genreId: number): Promise<Movie[]> {
    return fetchFromTmdb<Movie>(`/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&page=1`);
}
