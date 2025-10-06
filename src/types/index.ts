
export interface Movie {
  id: number;
  title: string;
  name?: string; // For TV shows which have name instead of title
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  genre_ids?: number[];
}
