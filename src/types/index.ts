
export interface Movie {
  id: number;
  title: string;
  name?: string; // For TV shows which have name instead of title
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  last_air_date?: string; // For TV shows, from details endpoint
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
}
