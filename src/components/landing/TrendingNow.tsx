
import { getTrendingTvShows, getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import StaticMovieCard from './StaticMovieCard';

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
    const detailedMovies = await Promise.all(
      movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type))
    );
    return detailedMovies.filter((movie): movie is Movie => movie !== null);
};

export default async function TrendingNow() {
    const rawTrending = await getTrendingTvShows('US');
    const trending = await fetchAndHydrate(rawTrending.slice(0, 10));

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Trending Now</h2>
            <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                    {trending.map((item) => (
                         <div key={item.id} className="w-60 flex-shrink-0">
                            <StaticMovieCard movie={item} />
                        </div>
                    ))}
                </div>
                 <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
