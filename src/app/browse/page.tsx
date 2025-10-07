
"use client";

import { useState, useEffect, useCallback } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Top10Row from '@/components/browse/Top10Row';
import ContinueWatchingRow from '@/components/browse/ContinueWatchingRow';
import Footer from "@/components/shared/Footer";
import { getTrending, getMoviesByGenre, getPopularMovies, getPopularTvShows, getTvShowsByGenre, getTrendingTvShows, getMovieOrTvDetails, searchMulti } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { useWatchHistory, type WatchHistoryItem } from '@/hooks/useWatchHistory';
import { useMyList } from '@/hooks/useMyList';
import React from 'react';
import { countries } from '@/lib/countries';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getRecommendations } from '@/ai/flows/recommendations-flow';
import { genres } from '@/lib/genres';


type MovieCategory = {
  title: string;
  movies: Movie[];
};

type ContinueWatchingMovie = Movie & { history: WatchHistoryItem };

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
    if (!movieList) return [];
  const detailedMovies = await Promise.all(
    movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type))
  );
  return detailedMovies.filter((movie): movie is Movie => movie !== null);
};


export default function BrowsePage() {
  const { activeProfile, isUserLoading } = useProfile();
  const { history, removeWatchHistory, isLoading: isHistoryLoading } = useWatchHistory();
  const { myList, isLoading: isMyListLoading } = useMyList();
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingMovie[]>([]);
  const [top10, setTop10] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const handleRemoveFromHistory = (id: number) => {
    removeWatchHistory(id);
  };
  
  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (isHistoryLoading || history.length === 0) {
        setContinueWatching([]);
        return;
      }
      const moviesWithHistory = await Promise.all(
        history.map(async (item) => {
          const movieDetails = await getMovieOrTvDetails(item.mediaId, item.media_type);
          if (movieDetails) {
            return { ...movieDetails, history: item };
          }
          return null;
        })
      );
      setContinueWatching(moviesWithHistory.filter((m): m is ContinueWatchingMovie => m !== null));
    };
    fetchContinueWatching();
  }, [history, isHistoryLoading]);

  const fetchCategoryMovies = useCallback(async (category: { type: string; value: string; }): Promise<Movie[]> => {
    switch (category.type) {
        case 'genre':
            const genreId = Object.keys(genres).find(key => genres[parseInt(key)] === category.value);
            if (genreId) {
                const movies = await getMoviesByGenre(parseInt(genreId));
                const tv = await getTvShowsByGenre(parseInt(genreId));
                return [...movies, ...tv].sort(() => 0.5 - Math.random());
            }
            return [];
        case 'trending':
            return getTrending();
        case 'popular_movies':
            return getPopularMovies();
        case 'popular_tv':
            return getPopularTvShows();
        case 'search':
            return searchMulti(category.value);
        default:
            return [];
    }
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!activeProfile || isMyListLoading) return;
      setLoading(true);
  
      try {
        const isKidsProfile = activeProfile.name.toLowerCase() === 'kids';

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
            const [trending, top10Shows] = await Promise.all([
                getTrending().then(fetchAndHydrate),
                getTrendingTvShows(activeProfile.country).then(fetchAndHydrate)
            ]);
            setTop10(top10Shows.slice(0, 10));
            if (trending.length > 0) {
                setBannerMovie(trending[Math.floor(Math.random() * trending.length)]);
            }

            // Fetch detailed items for history and mylist
            const historyDetails = await Promise.all(history.map(item => getMovieOrTvDetails(item.mediaId, item.media_type)));
            const myListDetails = await Promise.all(myList.map(id => getMovieOrTvDetails(id)));

            const recommendations = await getRecommendations({
                myList: myListDetails.filter(Boolean).map(m => m?.title || m?.name || ''),
                watchHistory: historyDetails.filter(Boolean).map(m => m?.title || m?.name || ''),
                favoriteGenre: activeProfile.favoriteGenreId ? genres[activeProfile.favoriteGenreId] : undefined,
            });

            if (recommendations) {
                const categoryPromises = recommendations.map(async (rec) => {
                    const movies = await fetchCategoryMovies(rec.category).then(fetchAndHydrate);
                    return { title: rec.title, movies };
                });

                const newCategories = await Promise.all(categoryPromises);
                setCategories(newCategories.filter(c => c.movies.length > 0));
            }
        }
      } catch (error) {
        console.error("Failed to fetch movies for browse page:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMovies();
  }, [activeProfile, history, myList, isMyListLoading, fetchCategoryMovies]);
  
  const getCountryName = (code: string) => {
    return countries.find(c => c.iso_3166_1 === code)?.english_name || 'the U.S.';
  }

  if (loading || isUserLoading || !activeProfile) {
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
                {index === 0 && top10.length > 0 && activeProfile.name.toLowerCase() !== 'kids' && (
                   <Top10Row title={`Top 10 TV Shows in ${getCountryName(activeProfile.country)} Today`} movies={top10} />
                )}
              </React.Fragment>
            ))}
             {categories.length === 0 && !loading && (
                 <div className="pl-4 md:pl-16">
                    <MovieRow title="Trending Now" movies={top10} />
                 </div>
             )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
