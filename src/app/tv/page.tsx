
"use client";

import { useState, useEffect, useCallback } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Top10Row from '@/components/browse/Top10Row';
import ContinueWatchingRow from '@/components/browse/ContinueWatchingRow';
import Footer from "@/components/shared/Footer";
import { getPopularTvShows, getTvShowsByGenre, getTrendingTvShows, getMovieOrTvDetails } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { useWatchHistory, type WatchHistoryItem } from '@/hooks/useWatchHistory';
import { genres } from '@/lib/genres';
import React from 'react';
import { countries } from '@/lib/countries';


type MovieCategory = {
  title: string;
  movies: Movie[];
};

type ContinueWatchingMovie = Movie & { history: WatchHistoryItem };

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
  const detailedMovies = await Promise.all(
    movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type || 'tv'))
  );
  return detailedMovies.filter((movie): movie is Movie => movie !== null);
};


export default function TvPage() {
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
          history
            .filter(item => item.media_type === 'tv')
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
            kidsTv,
            animatedTv,
          ] = await Promise.all([
            getTvShowsByGenre(10762).then(fetchAndHydrate), // Kids TV
            getTvShowsByGenre(16).then(fetchAndHydrate), // Animated TV
          ]);
          
          const kidsContent = [...kidsTv, ...animatedTv].sort(() => 0.5 - Math.random());

          const newCategories: MovieCategory[] = [
            { title: "Kids TV", movies: kidsTv },
            { title: "Animated TV", movies: animatedTv },
          ];

          setCategories(newCategories);
          setTop10([]); 

          if (kidsContent.length > 0) {
            setBannerMovie(kidsContent[Math.floor(Math.random() * kidsContent.length)]);
          }

        } else {
            const [
              top10Shows,
              popularTv, 
              favoriteGenreTv,
              actionAdventure,
              animation,
              comedy, 
              crime,
              documentary,
              drama,
              mystery,
              scifi,
              reality
            ] = await Promise.all([
              getTrendingTvShows(profile.country).then(fetchAndHydrate),
              getPopularTvShows().then(fetchAndHydrate),
              profile.favoriteGenreId ? getTvShowsByGenre(profile.favoriteGenreId).then(fetchAndHydrate) : Promise.resolve([]),
              getTvShowsByGenre(10759).then(fetchAndHydrate), // Action & Adventure
              getTvShowsByGenre(16).then(fetchAndHydrate),    // Animation
              getTvShowsByGenre(35).then(fetchAndHydrate),   // Comedy
              getTvShowsByGenre(80).then(fetchAndHydrate),    // Crime
              getTvShowsByGenre(99).then(fetchAndHydrate),    // Documentary
              getTvShowsByGenre(18).then(fetchAndHydrate),    // Drama
              getTvShowsByGenre(9648).then(fetchAndHydrate),  // Mystery
              getTvShowsByGenre(10765).then(fetchAndHydrate), // Sci-Fi & Fantasy
              getTvShowsByGenre(10764).then(fetchAndHydrate), // Reality
            ]);
            
            const newCategories: MovieCategory[] = [
              { title: "Popular TV Shows", movies: popularTv },
            ];

            setTop10(top10Shows.slice(0, 10));
      
            if (profile.favoriteGenreId) {
              const genreName = genres[profile.favoriteGenreId];
              const favoriteGenreContent = [...favoriteGenreTv].sort(() => 0.5 - Math.random());
              if (genreName && favoriteGenreContent.length > 0) {
                newCategories.push({ title: `TV Shows Because you like ${genreName}`, movies: favoriteGenreContent });
              }
            }
            
            newCategories.push({ title: "Action & Adventure", movies: actionAdventure });
            newCategories.push({ title: "Animation", movies: animation });
            newCategories.push({ title: "TV Comedies", movies: comedy });
            newCategories.push({ title: "Crime TV", movies: crime });
            newCategories.push({ title: "Documentaries", movies: documentary });
            newCategories.push({ title: "TV Dramas", movies: drama });
            newCategories.push({ title: "Mystery", movies: mystery });
            newCategories.push({ title: "Sci-Fi & Fantasy", movies: scifi });
            newCategories.push({ title: "Reality TV", movies: reality });
      
            setCategories(newCategories);
      
            if (popularTv.length > 0) {
              setBannerMovie(popularTv[Math.floor(Math.random() * popularTv.length)]);
            }
        }
      } catch (error) {
        console.error("Failed to fetch tv shows for tv page:", error);
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
        <div className="flex items-center justify-center h-[400px]">
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
            {top10.length > 0 && profile.name.toLowerCase() !== 'kids' && (
                <Top10Row title={`Top 10 TV Shows in ${getCountryName(profile.country)} Today`} movies={top10} />
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
