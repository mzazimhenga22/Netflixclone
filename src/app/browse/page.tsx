
"use client";

import { useState, useEffect, useCallback } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Top10Row from '@/components/browse/Top10Row';
import ContinueWatchingRow from '@/components/browse/ContinueWatchingRow';
import Footer from "@/components/shared/Footer";
import { getTrending, getMoviesByGenre, getPopularMovies, getPopularTvShows, getTvShowsByGenre, getTrendingTvShows, getMovieOrTvDetails } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { useWatchHistory, type WatchHistoryItem } from '@/hooks/useWatchHistory';
import { genres } from '@/lib/genres';
import React from 'react';
import { countries } from '@/lib/countries';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


type MovieCategory = {
  title: string;
  movies: Movie[];
};

type ContinueWatchingMovie = Movie & { history: WatchHistoryItem };

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
  const detailedMovies = await Promise.all(
    movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type))
  );
  return detailedMovies.filter((movie): movie is Movie => movie !== null);
};


export default function BrowsePage() {
  const { profile } = useProfile();
  const { history, removeWatchHistory, setHistory } = useWatchHistory();
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingMovie[]>([]);
  const [top10, setTop10] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const handleRemoveFromHistory = (id: number) => {
    removeWatchHistory(id);
    setContinueWatching(prev => prev.filter(m => m.id !== id));
  };
  
  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (history.length > 0) {
        const moviesWithHistory = await Promise.all(
          history.map(async (item) => {
            const movieDetails = await getMovieOrTvDetails(item.id, item.media_type);
            if (movieDetails) {
              return { ...movieDetails, history: item };
            }
            return null;
          })
        );
        setContinueWatching(moviesWithHistory.filter((m): m is ContinueWatchingMovie => m !== null));
      }
    };
    fetchContinueWatching();
  }, [history]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!profile) return;
      setLoading(true);
  
      try {
        const isKidsProfile = profile.name.toLowerCase() === 'kids';

        if (isKidsProfile) {
          const [
            familyMovies,
            animationMovies,
            kidsTv,
            animatedTv,
          ] = await Promise.all([
            getMoviesByGenre(10751).then(fetchAndHydrate), // Family
            getMoviesByGenre(16).then(fetchAndHydrate),   // Animation
            getTvShowsByGenre(10762).then(fetchAndHydrate), // Kids TV
            getTvShowsByGenre(16).then(fetchAndHydrate), // Animated TV
          ]);
          
          const kidsContent = [...familyMovies, ...animationMovies, ...kidsTv, ...animatedTv].sort(() => 0.5 - Math.random());

          const newCategories: MovieCategory[] = [
            { title: "Animation", movies: [...animationMovies, ...animatedTv].sort(() => 0.5 - Math.random()) },
            { title: "Family Fun", movies: familyMovies },
            { title: "Kids TV", movies: kidsTv },
          ];

          setCategories(newCategories);
          setTop10([]); // No top 10 for kids profile for now

          if (kidsContent.length > 0) {
            setBannerMovie(kidsContent[Math.floor(Math.random() * kidsContent.length)]);
          }

        } else {
            const [
              trending, 
              top10Shows,
              popularMovies,
              popularTv, 
              favoriteGenreMovies,
              favoriteGenreTv,
              comedyMovies,
              comedyTv, 
              horrorMovies, 
              romanceMovies, 
              documentaryMovies,
              actionMovies,
              actionTv,
              dramaMovies,
              dramaTv,
              scifiMovies,
              scifiTv,
              animationMovies,
              animationTv
            ] = await Promise.all([
              getTrending().then(fetchAndHydrate),
              getTrendingTvShows(profile.country).then(fetchAndHydrate),
              getPopularMovies().then(fetchAndHydrate),
              getPopularTvShows().then(fetchAndHydrate),
              profile.favoriteGenreId ? getMoviesByGenre(profile.favoriteGenreId).then(fetchAndHydrate) : Promise.resolve([]),
              profile.favoriteGenreId ? getTvShowsByGenre(profile.favoriteGenreId).then(fetchAndHydrate) : Promise.resolve([]),
              getMoviesByGenre(35).then(fetchAndHydrate), // Comedy Movies
              getTvShowsByGenre(35).then(fetchAndHydrate), // Comedy TV
              getMoviesByGenre(27).then(fetchAndHydrate), // Horror Movies
              getMoviesByGenre(10749).then(fetchAndHydrate), // Romance Movies
              getMoviesByGenre(99).then(fetchAndHydrate), // Documentary Movies
              getMoviesByGenre(28).then(fetchAndHydrate), // Action Movies
              getTvShowsByGenre(10759).then(fetchAndHydrate), // Action & Adventure TV
              getMoviesByGenre(18).then(fetchAndHydrate), // Drama Movies
              getTvShowsByGenre(18).then(fetchAndHydrate), // Drama TV
              getMoviesByGenre(878).then(fetchAndHydrate), // Sci-Fi Movies
              getTvShowsByGenre(10765).then(fetchAndHydrate), // Sci-Fi & Fantasy TV
              getMoviesByGenre(16).then(fetchAndHydrate), // Animation Movies
              getTvShowsByGenre(16).then(fetchAndHydrate), // Animation TV
            ]);
            
            const newCategories: MovieCategory[] = [
              { title: "Trending Now", movies: trending },
              { title: "Popular Movies", movies: popularMovies },
              { title: "Popular TV Shows", movies: popularTv },
            ];

            setTop10(top10Shows.slice(0, 10));
      
            if (profile.favoriteGenreId) {
              const genreName = genres[profile.favoriteGenreId];
              const favoriteGenreContent = [...favoriteGenreMovies, ...favoriteGenreTv].sort(() => 0.5 - Math.random());
              if (genreName) {
                newCategories.push({ title: `Because you like ${genreName}`, movies: favoriteGenreContent });
              }
            }

            const actionAdventure = [...actionMovies, ...actionTv].sort(() => 0.5 - Math.random());
            const dramas = [...dramaMovies, ...dramaTv].sort(() => 0.5 - Math.random());
            const scifiFantasy = [...scifiMovies, ...scifiTv].sort(() => 0.5 - Math.random());
            const comedies = [...comedyMovies, ...comedyTv].sort(() => 0.5 - Math.random());
            const animation = [...animationMovies, ...animationTv].sort(() => 0.5 - Math.random());

            newCategories.push({ title: "Action & Adventure", movies: actionAdventure });
            newCategories.push({ title: "Comedies", movies: comedies });
            newCategories.push({ title: "Dramas", movies: dramas });
            newCategories.push({ title: "Scary Movies", movies: horrorMovies });
            newCategories.push({ title: "Romance", movies: romanceMovies });
            newCategories.push({ title: "Sci-Fi & Fantasy", movies: scifiFantasy });
            newCategories.push({ title: "Animation", movies: animation });
            newCategories.push({ title: "Documentaries", movies: documentaryMovies });
      
            setCategories(newCategories);
      
            if (trending.length > 0) {
              setBannerMovie(trending[Math.floor(Math.random() * trending.length)]);
            }
        }
      } catch (error) {
        console.error("Failed to fetch movies for browse page:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMovies();
  }, [profile]);
  
  const getCountryName = (code: string) => {
    return countries.find(c => c.iso_3166_1 === code)?.english_name || 'the U.S.';
  }

  if (loading || !profile) {
      return (
        <div className="flex items-center justify-center h-screen bg-black">
          <LoadingSpinner />
        </div>
      )
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="overflow-x-hidden">
        <Banner movie={bannerMovie} />
        <div className="relative -mt-8 md:-mt-20 pb-32">
          <div className="space-y-8 lg:space-y-12">
            {continueWatching.length > 0 && (
                <ContinueWatchingRow 
                    title="Continue Watching"
                    movies={continueWatching}
                    onRemove={handleRemoveFromHistory}
                />
            )}
            {categories.map((category, index) => (
              <React.Fragment key={category.title}>
                <MovieRow title={category.title} movies={category.movies} />
                {index === 0 && top10.length > 0 && profile.name.toLowerCase() !== 'kids' && (
                   <Top10Row title={`Top 10 TV Shows in ${getCountryName(profile.country)} Today`} movies={top10} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
