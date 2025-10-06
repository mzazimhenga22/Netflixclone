
import { getTrendingTvShows, getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import Image from 'next/image';
import { TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
    const detailedMovies = await Promise.all(
      movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type))
    );
    return detailedMovies.filter((movie): movie is Movie => movie !== null);
};

export default async function TrendingNow() {
    const rawTrending = await getTrendingTvShows('US');
    const trending = await fetchAndHydrate(rawTrending.slice(0, 5));

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Trending Now</h2>
            <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                    {trending.map((item, index) => (
                        <div key={item.id} className="flex-shrink-0 flex items-end">
                             <div 
                                className="text-[140px] md:text-[200px] font-black text-transparent transition-transform duration-300 ease-in-out group-hover:scale-105" 
                                style={{
                                    WebkitTextStroke: '2px rgba(120, 120, 120, 0.8)',
                                    lineHeight: '0.8',
                                }}
                                >
                                {index + 1}
                            </div>
                            <div className="relative -ml-5 md:-ml-8 w-[120px] h-[180px] md:w-[150px] md:h-[225px] rounded-md overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110 shadow-lg">
                                <Image
                                    src={`${TMDB_IMAGE_BASE_URL.replace('original', 'w500')}${item.poster_path}`}
                                    alt={item.name || 'Trending item'}
                                    width={150}
                                    height={225}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
