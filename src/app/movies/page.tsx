
"use client";

import { useState, useEffect } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import ContinueWatchingRow from '@/components/browse/ContinueWatchingRow';
import Footer from "@/components/shared/Footer";
import { getMoviesByGenre, getPopularMovies, getMovieOrTvDetails } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { useWatchHistory, type WatchHistoryItem } from '@/hooks/useWatchHistory';
import { movieGenres } from '@/lib/movieGenres';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovieCard from '@/components/browse/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { history, removeWatchHistory } = useWatchHistory();
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);

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
              popularMovies,
              favoriteGenreMovies,
              action,
              comedy,
              horror,
              romance,
              documentaries,
              thriller,
              scifi,
              adventure,
              fantasy
            ] = await Promise.all([
              getPopularMovies().then(fetchAndHydrate),
              profile.favoriteGenreId ? getMoviesByGenre(profile.favoriteGenreId).then(fetchAndHydrate) : Promise.resolve([]),
              getMoviesByGenre(28).then(fetchAndHydrate), // Action
              getMoviesByGenre(35).then(fetchAndHydrate), // Comedy
              getMoviesByGenre(27).then(fetchAndHydrate), // Horror
              getMoviesByGenre(10749).then(fetchAndHydrate), // Romance
              getMoviesByGenre(99).then(fetchAndHydrate), // Documentary
              getMoviesByGenre(53).then(fetchAndHydrate), // Thriller
              getMoviesByGenre(878).then(fetchAndHydrate), // Sci-Fi
              getMoviesByGenre(12).then(fetchAndHydrate), // Adventure
              getMoviesByGenre(14).then(fetchAndHydrate), // Fantasy
            ]);

            const newCategories: MovieCategory[] = [
              { title: "Popular Movies", movies: popularMovies },
            ];

            if (profile.favoriteGenreId) {
              const favoriteGenre = movieGenres.find(g => g.id === profile.favoriteGenreId);
              if (favoriteGenre) {
                newCategories.push({ title: `Because you like ${favoriteGenre.name}`, movies: favoriteGenreMovies });
              }
            }

            newCategories.push({ title: "Action Movies", movies: action });
            newCategories.push({ title: "Adventure", movies: adventure });
            newCategories.push({ title: "Fantasy", movies: fantasy });
            newCategories.push({ title: "Sci-Fi", movies: scifi });
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

    if (!selectedGenre) {
        fetchMovies();
    }
  }, [profile, selectedGenre]);
  
  useEffect(() => {
    const fetchGenreMovies = async () => {
        if (selectedGenre) {
            setGenreLoading(true);
            const genreId = parseInt(selectedGenre, 10);
            const movies = await getMoviesByGenre(genreId, 50).then(fetchAndHydrate);
            setGenreMovies(movies);
            setGenreLoading(false);
        }
    }
    fetchGenreMovies();
  }, [selectedGenre]);

  if (loading || !profile) {
      return (
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
  }
  
  const handleGenreChange = (genreValue: string) => {
    if (genreValue === 'all') {
        setSelectedGenre('');
        setGenreMovies([]);
    } else {
        setSelectedGenre(genreValue);
    }
  };

  const selectedGenreName = selectedGenre ? movieGenres.find(g => g.id.toString() === selectedGenre)?.name : 'All Genres';

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="overflow-x-hidden">
        <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent z-20" />
            
            {!bannerMovie ? (
                <Skeleton className="w-full h-[56.25vw] min-h-[400px] max-h-[800px]" />
            ) : (
                <Banner movie={bannerMovie} />
            )}

            <div className="absolute top-20 left-4 md:left-16 z-30">
                <div className="flex items-baseline gap-6">
                    <h1 className="text-3xl md:text-5xl font-bold">
                        {selectedGenre ? selectedGenreName : "Movies"}
                    </h1>
                     <Select value={selectedGenre} onValueChange={handleGenreChange}>
                        <SelectTrigger className="w-[180px] bg-card/80 border-white/40 text-base font-bold">
                            <SelectValue placeholder="Genres" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genres</SelectItem>
                            {movieGenres.map(genre => (
                                <SelectItem key={genre.id} value={genre.id.toString()}>{genre.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 {selectedGenre && (
                    <button onClick={() => handleGenreChange('all')} className="text-muted-foreground hover:text-white text-sm mt-2 bg-black/50 px-2 py-1 rounded-md">
                        &times; Clear Filter
                    </button>
                )}
            </div>
        </div>
        
        <div className="pb-32 -mt-8 md:-mt-20 relative z-10">
            {selectedGenre ? (
                genreLoading ? (
                     <div className="flex items-center justify-center h-[40vh]">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="px-4 md:px-16 pt-8">
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {genreMovies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div className="pt-8 space-y-8 lg:space-y-12">
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
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
