
"use client";

import { useState, useEffect } from 'react';
import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Top10Row from '@/components/browse/Top10Row';
import Footer from "@/components/shared/Footer";
import { getTrending, getMoviesByGenre, getPopularMovies, getPopularTvShows, getTvShowsByGenre, getTrendingTvShows } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { useProfile } from '@/hooks/useProfile';
import { genres } from '@/lib/genres';
import React from 'react';
import { countries } from '@/lib/countries';


type MovieCategory = {
  title: string;
  movies: Movie[];
};

export default function BrowsePage() {
  const { profile } = useProfile();
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [top10, setTop10] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!profile) return;
      setLoading(true);
  
      try {
        const [
          trending, 
          top10Shows,
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
          getTrendingTvShows(profile.country),
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

        setTop10(top10Shows.slice(0, 10));
  
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
  
  const getCountryName = (code: string) => {
    return countries.find(c => c.iso_3166_1 === code)?.english_name || 'the U.S.';
  }

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
            {categories.map((category, index) => (
              <React.Fragment key={category.title}>
                <MovieRow title={category.title} movies={category.movies} />
                {index === 0 && top10.length > 0 && (
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
