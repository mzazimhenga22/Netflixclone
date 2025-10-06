
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import MovieModal from './MovieModal';
import { Info, Play, Volume2 } from 'lucide-react';
import { getTrendingMovies, TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { cn } from '@/lib/utils';

const Banner = () => {
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBannerMovie = async () => {
      const movies = await getTrendingMovies();
      // Select a random movie to feature in the banner
      if (movies.length > 0) {
        const movie = movies[Math.floor(Math.random() * movies.length)];
        setBannerMovie(movie);
      }
    };
    fetchBannerMovie();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  if (!bannerMovie) {
    return (
        <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full flex items-center justify-center">
            <p>Loading banner...</p>
        </div>
    );
  }

  const title = bannerMovie.title || bannerMovie.name;
  const description = bannerMovie.overview;
  const imageUrl = `${TMDB_IMAGE_BASE_URL}${bannerMovie.backdrop_path}`;


  return (
    <>
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
          <Image
            src={imageUrl}
            alt={title || 'Movie banner'}
            fill
            className="object-cover"
            priority
          />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 right-4 md:right-auto z-10">
          <div className="max-w-lg">
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-black">
              {title}
            </h1>
            <p className="hidden md:block text-sm md:text-base max-w-md text-white/90 mt-2 md:mt-4 line-clamp-3">
              {description}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-6">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/80 font-bold">
              <Link href={`/watch/${bannerMovie.id}`}>
                <Play className="mr-2 h-6 w-6" /> Play
              </Link>
            </Button>
            <Button onClick={openModal} size="lg" className="bg-gray-500/70 text-white hover:bg-gray-500/50 backdrop-blur-sm font-bold">
              <Info className="mr-2 h-6 w-6" /> More Info
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-[10%] md:bottom-[20%] right-4 md:right-8 z-10 flex items-center space-x-3">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-2 border-white/40 bg-black/30 text-white hover:border-white hover:bg-black/50">
              <Volume2 className="h-6 w-6" />
          </Button>
          <div className="bg-black/30 border-l-4 border-white/40 px-4 py-2 text-sm font-semibold">
              16+
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && (
            <DialogContent className={cn("p-0 w-[90vw] max-w-[90vw] bg-card border-0 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto hide-scrollbar")}>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <MovieModal movie={bannerMovie} onClose={closeModal} />
            </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default Banner;
