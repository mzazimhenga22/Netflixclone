import { getTrendingTvShows, getMovieOrTvDetails } from "@/lib/tmdb";
import type { Movie } from "@/types";
import StaticMovieCard from "./StaticMovieCard";

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
  const detailedMovies = await Promise.all(
    movieList.map((movie) => getMovieOrTvDetails(movie.id, movie.media_type))
  );
  return detailedMovies.filter((movie): movie is Movie => movie !== null);
};

export default async function TrendingNow() {
  const rawTrending = await getTrendingTvShows("US");
  const trending = await fetchAndHydrate(rawTrending.slice(0, 10));

  return (
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Netflix-style dome (refined: thin red line, subtle blue center, dark corners) */}
<div
  className="absolute -top-[140px] left-0 w-screen h-[260px] pointer-events-none overflow-hidden z-0"
  style={{
    backgroundImage: [
      // 1) Thin red arc at the base of the dome (sharp, concentrated)
      `radial-gradient(120% 60% at 50% 100%, rgba(229,9,20,0.98) 0%, rgba(229,9,20,0.8) 4%, rgba(229,9,20,0.45) 8%, rgba(229,9,20,0.12) 12%, rgba(0,0,0,0) 14%)`,
      // 2) Subtle bluish mid glow centered slightly above the base (small / soft)
      `radial-gradient(60% 40% at 50% 82%, rgba(10,30,80,0.42) 0%, rgba(10,30,80,0.14) 28%, rgba(0,0,0,0) 55%)`,
      // 3) Main dark dome fade (makes the top go to true black)
      `radial-gradient(100% 200% at 50% 100%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.72) 60%, rgba(0,0,0,1) 100%)`,
      // 4) Side vignettes so corners are darker than center
      `linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.96) 100%)`,
    ].join(", "),
    clipPath: "ellipse(100% 100% at 50% 100%)",
    transform: "translateY(18%)",
    opacity: 0.95,
    filter: "contrast(1.05) saturate(0.95)",
  }}
/>


      <h2 className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-white">
        Trending Now
      </h2>

      <div className="relative z-10">
        <div className="flex space-x-10 overflow-x-auto pb-6 hide-scrollbar">
          {trending.map((item, index) => (
            <div key={item.id} className="relative flex-shrink-0">
              <StaticMovieCard movie={item} index={index} />
            </div>
          ))}
        </div>

        {/* Gradient fade edges */}
        <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
