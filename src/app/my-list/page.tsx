
"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/browse/Navbar";
import Footer from "@/components/shared/Footer";
import MovieCard from '@/components/browse/MovieCard';
import { useMyList } from '@/hooks/useMyList';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function MyListPage() {
  const { profile } = useProfile();
  const { myList: myListIds } = useMyList();
  const [myListMovies, setMyListMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListMovies = async () => {
      if (myListIds.length === 0) {
        setMyListMovies([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const moviePromises = myListIds.map(id => getMovieOrTvDetails(id));
        const movies = await Promise.all(moviePromises);
        setMyListMovies(movies.filter((movie): movie is Movie => movie !== null));
      } catch (error) {
        console.error("Failed to fetch My List movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListMovies();
  }, [myListIds]);

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
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">My List</h1>
          {myListMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {myListMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <h2 className="text-2xl font-semibold">Your list is empty</h2>
              <p className="text-muted-foreground mt-2">
                Add shows and movies to your list to watch them later.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
