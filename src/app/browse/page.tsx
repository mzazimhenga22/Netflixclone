
"use client";

import { useState, useEffect } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Footer from "@/components/shared/Footer";
import { getTrending, getMoviesByGenre, getPopularMovies, getPopularTvShows, getTvShowsByGenre } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { genres } from '@/lib/genres';

type MovieCategory = {
  title: string;
  movies: Movie[];
};

export default function BrowsePage() {
  const { profile } = useProfile();
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!profile) return;
      setLoading(true);
  
      try {
        const [
          trending, 
          popularMovies,
          popularTv, 
          favoriteGenreMovies,
          favoriteGenreTv,
          comedy, 
          horror, 
          romance, 
          documentaries
        ] = await Promise.all([
          getTrending(),
          getPopularMovies(),
          getPopularTvShows(),
          profile.favoriteGenreId ? getMoviesByGenre(profile.favoriteGenreId) : Promise.resolve([]),
          profile.favoriteGenreId ? getTvShowsByGenre(profile.favoriteGenreId) : Promise.resolve([]),
          getMoviesByGenre(35), // Comedy
          getMoviesByGenre(27), // Horror
          getMoviesByGenre(10749), // Romance
          getMoviesByGenre(99), // Documentary
        ]);
        
        const newCategories: MovieCategory[] = [
          { title: "Trending Now", movies: trending },
          { title: "Popular Movies", movies: popularMovies },
          { title: "Popular TV Shows", movies: popularTv },
        ];
  
        if (profile.favoriteGenreId) {
          const genreName = genres[profile.favoriteGenreId];
          const favoriteGenreContent = [...favoriteGenreMovies, ...favoriteGenreTv].sort(() => 0.5 - Math.random());
          if (genreName) {
            newCategories.push({ title: `Because you like ${genreName}`, movies: favoriteGenreContent });
          }
        }

        newCategories.push({ title: "Comedies", movies: comedy });
        newCategories.push({ title: "Scary Movies", movies: horror });
        newCategories.push({ title: "Romance", movies: romance });
        newCategories.push({ title: "Documentaries", movies: documentaries });
  
        setCategories(newCategories);
  
        if (trending.length > 0) {
          setBannerMovie(trending[Math.floor(Math.random() * trending.length)]);
        }
      } catch (error) {
        console.error("Failed to fetch movies for browse page:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMovies();
  }, [profile]);
  
  if (loading || !profile) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p>Loading your experience...</p>
            </div>
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
            {categories.map((category) => (
              <MovieRow key={category.title} title={category.title} movies={category.movies} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
