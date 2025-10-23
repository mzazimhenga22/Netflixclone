
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from "@/components/browse/Navbar";
import Footer from "@/components/shared/Footer";
import MovieCard from '@/components/browse/MovieCard';
import { searchMulti, getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
  const detailedMovies = await Promise.all(
    movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type))
  );
  return detailedMovies.filter((movie): movie is Movie => movie !== null && !!movie.backdrop_path);
};

function SearchResults() {
  const { activeProfile: profile } = useProfile();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const rawResults = await searchMulti(query);
        const searchResults = await fetchAndHydrate(rawResults);
        setResults(searchResults);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {query && <h1 className="text-2xl md:text-3xl font-bold mb-8">Search results for &quot;{query}&quot;</h1>}
          
          {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-video rounded-md" />)}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <h2 className="text-2xl font-semibold">No results found for &quot;{query}&quot;</h2>
              <p className="text-muted-foreground mt-2">
                Try searching for a different movie or TV show.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-black">
                <LoadingSpinner />
            </div>
        }>
            <SearchResults />
        </Suspense>
    )
}
