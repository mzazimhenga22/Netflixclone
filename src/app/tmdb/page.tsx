
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/browse/Navbar';
import Footer from '@/components/shared/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
}

const TMDB_API_KEY = '1ba41bda48d0f1c90954f4811637b6d6';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export default function TmdbPage() {
  const [trending, setTrending] = useState<TmdbMovie[]>([]);
  const [heroMovie, setHeroMovie] = useState<TmdbMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`);
        if (!res.ok) {
          throw new Error('Failed to fetch trending movies');
        }
        const data = await res.json();
        const movies = data.results.slice(0, 20);
        setTrending(movies);
        if (movies.length > 0) {
          setHeroMovie(movies[Math.floor(Math.random() * 5)]); // Pick a random hero from top 5
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="bg-background min-h-screen text-white">
      <Navbar />
      <main>
        {/* Hero Section */}
        {isLoading && !heroMovie && (
          <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        {heroMovie && (
          <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
            <Image
              src={`${TMDB_IMAGE_BASE_URL}${heroMovie.backdrop_path}`}
              alt={heroMovie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            <div className="absolute bottom-[20%] left-4 md:left-16 z-10">
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-black max-w-lg">{heroMovie.title}</h1>
              <p className="hidden md:block text-sm md:text-base max-w-md text-white/90 mt-2 md:mt-4">
                {heroMovie.overview}
              </p>
              <Button size="lg" className="bg-white text-black hover:bg-white/80 font-bold mt-4 md:mt-6">
                <Play className="mr-2 h-6 w-6" /> Play
              </Button>
            </div>
          </div>
        )}

        {/* Movie Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Trending This Week</h2>
          {isLoading && trending.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="aspect-[2/3]">
                  <Skeleton className="w-full h-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((movie) => (
                <div key={movie.id} className="group relative aspect-[2/3] bg-zinc-900 rounded-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105">
                  <Image
                    src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <h3 className="font-bold text-sm line-clamp-2">{movie.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
