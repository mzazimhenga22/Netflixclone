
const API_KEY = '1ba41bda48d0f1c90954f4811637b6d6';
const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export interface TmdbMovie {
  id: number;
  title: string;
  name?: string; // For TV shows which have name instead of title
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export async function getTrendingMovies(): Promise<TmdbMovie[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`);
    if (!res.ok) {
      console.error("Failed to fetch trending movies:", res.statusText);
      return [];
    }
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}
