
"use client";

import { useState, useEffect, useCallback } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import ContinueWatchingRow from '@/components/browse/ContinueWatchingRow';
import Footer from "@/components/shared/Footer";
import { getTrending, getMoviesByGenre, getPopularMovies, getMovieOrTvDetails } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { useWatchHistory, type WatchHistoryItem } from '@/hooks/useWatchHistory';
import { genres } from '@/lib/genres';
import React from 'react';

type MovieCategory = {
  title: string;
  movies: Movie[];
};

type ContinueWatchingMovie = Movie & { history: WatchHistoryItem };

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
  const detailedMovies = await Promise.all(
    movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type || 'movie'))
  );
  return detailedMovies.filter((movie): movie is Movie => movie !== null);
};


export default function MoviesPage() {
  const { profile } = useProfile();
  const { history, removeWatchHistory, setHistory } = useWatchHistory();
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const handleRemoveFromHistory = (id: number) => {
    removeWatchHistory(id);
    setContinueWatching(prev => prev.filter(m => m.id !== id));
  };
  
  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (history.length > 0) {
        const moviesWithHistory = await Promise.all(
          history
            .filter(item => item.media_type === 'movie')
            .map(async (item) => {
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
          ] = await Promise.all([
            getMoviesByGenre(10751).then(fetchAndHydrate), // Family
            getMoviesByGenre(16).then(fetchAndHydrate),   // Animation
          ]);
          
          const kidsContent = [...familyMovies, ...animationMovies].sort(() => 0.5 - Math.random());

          const newCategories: MovieCategory[] = [
            { title: "Animation", movies: animationMovies },
            { title: "Family Fun", movies: familyMovies },
          ];

          setCategories(newCategories);

          if (kidsContent.length > 0) {
            setBannerMovie(kidsContent[Math.floor(Math.random() * kidsContent.length)]);
          }

        } else {
            const [
              trending, 
              popularMovies,
              favoriteGenreMovies,
              comedy, 
              horror, 
              romance, 
              documentaries,
              action,
              thriller,
            ] = await Promise.all([
              getTrending().then(movies => movies.filter(m => m.media_type === 'movie')).then(fetchAndHydrate),
              getPopularMovies().then(fetchAndHydrate),
              profile.favoriteGenreId ? getMoviesByGenre(profile.favoriteGenreId).then(fetchAndHydrate) : Promise.resolve([]),
              getMoviesByGenre(35).then(fetchAndHydrate), // Comedy
              getMoviesByGenre(27).then(fetchAndHydrate), // Horror
              getMoviesByGenre(10749).then(fetchAndHydrate), // Romance
              getMoviesByGenre(99).then(fetchAndHydrate), // Documentary
              getMoviesByGenre(28).then(fetchAndHydrate), // Action
              getMoviesByGenre(53).then(fetchAndHydrate), // Thriller
            ]);
            
            const newCategories: MovieCategory[] = [
              { title: "Trending Now", movies: trending },
              { title: "Popular Movies", movies: popularMovies },
            ];
      
            if (profile.favoriteGenreId) {
              const genreName = genres[profile.favoriteGenreId];
              const favoriteGenreContent = [...favoriteGenreMovies].sort(() => 0.5 - Math.random());
              if (genreName) {
                newCategories.push({ title: `Because you like ${genreName}`, movies: favoriteGenreContent });
              }
            }

            newCategories.push({ title: "Action Movies", movies: action });
            newCategories.push({ title: "Comedies", movies: comedy });
            newCategories.push({ title: "Scary Movies", movies: horror });
            newCategories.push({ title: "Thrillers", movies: thriller });
            newCategories.push({ title: "Romance Movies", movies: romance });
            newCategories.push({ title: "Documentaries", movies: documentaries });
      
            setCategories(newCategories);
      
            if (popularMovies.length > 0) {
              setBannerMovie(popularMovies[Math.floor(Math.random() * popularMovies.length)]);
            }
        }
      } catch (error) {
        console.error("Failed to fetch movies for movies page:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMovies();
  }, [profile]);
  

  if (loading || !profile) {
      return (
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            {categories.map((category) => (
              <React.Fragment key={category.title}>
                <MovieRow title={category.title} movies={category.movies} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
