import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Footer from "@/components/shared/Footer";
import { getTrendingMovies, getMoviesByGenre, getPopularMovies } from "@/lib/tmdb";
import type { Movie } from "@/types";

const genreMap: { [key: string]: number } = {
  "Sci-Fi & Fantasy": 878, // Sci-Fi
  "Action & Adventure": 28, // Action
};

export default async function BrowsePage() {
  const trending = await getTrendingMovies();
  const popular = await getPopularMovies();
  const scifi = await getMoviesByGenre(genreMap["Sci-Fi & Fantasy"]);
  const action = await getMoviesByGenre(genreMap["Action & Adventure"]);

  const movieCategories: { title: string; movies: Movie[] }[] = [
    { title: "Trending Now", movies: trending },
    { title: "Popular on StreamClone", movies: popular },
    { title: "Sci-Fi & Fantasy", movies: scifi },
    { title: "Action & Adventure", movies: action },
  ];

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="overflow-x-hidden">
        <Banner />
        <div className="relative -mt-8 md:-mt-20 pb-32">
          <div className="space-y-8 lg:space-y-12">
            {movieCategories.map((category) => (
              <MovieRow key={category.title} title={category.title} movies={category.movies} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
