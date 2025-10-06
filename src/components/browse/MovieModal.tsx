
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Play, ThumbsUp, Volume2, X } from 'lucide-react';
import type { Movie } from '@/types';
import { TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import MovieRow from './MovieRow';
import { useEffect, useState } from 'react';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  useEffect(() => {
    // In a real app, you would fetch similar movies from TMDB API
    // For now, we'll just simulate with some mock data structure
    const fetchSimilar = async () => {
      // This is just a placeholder, replace with actual API call
      // const similar = await getSimilarMovies(movie.id);
      // setSimilarMovies(similar.slice(0, 3));
    };

    fetchSimilar();
  }, [movie.id]);

  const posterUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
    : `https://picsum.photos/seed/${movie.id}/1280/720`;

  return (
    <div className="text-white">
      <div className="relative aspect-video">
        <Image
          src={posterUrl}
          alt={movie.title || movie.name || "Movie poster"}
          fill
          className="object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
            <Button size="icon" variant="ghost" onClick={onClose} className="h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70">
              <X className="h-6 w-6" />
            </Button>
        </div>
        <div className="absolute bottom-10 left-10">
          <h2 className="text-4xl font-black mb-4">{movie.title || movie.name}</h2>
          <div className="flex items-center gap-2">
            <Button size="lg" className="bg-white text-black hover:bg-white/80 font-bold text-lg">
              <Play className="mr-2 h-7 w-7" /> Play
            </Button>
            <Button size="icon" variant="outline" className="h-11 w-11 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
              <Plus className="h-7 w-7" />
            </Button>
            <Button size="icon" variant="outline" className="h-11 w-11 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
              <ThumbsUp className="h-7 w-7" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-12 right-10">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-2 border-white/40 bg-black/30 text-white hover:border-white hover:bg-black/50">
                <Volume2 className="h-6 w-6" />
            </Button>
        </div>
      </div>
      <div className="p-10 grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-3 text-base mb-4">
            <span className="text-green-400 font-semibold">{(movie.vote_average * 10).toFixed(0)}% Match</span>
            <span>{movie.release_date?.substring(0, 4)}</span>
            <span className="border px-1.5 text-sm">16+</span>
            <span className="border px-1.5 text-sm">HD</span>
          </div>
          <p className="text-lg line-clamp-4">
            {movie.overview}
          </p>
        </div>
        <div className="text-sm">
            <p className="text-muted-foreground">
                <span className="font-semibold text-white/80">Genres:</span> {movie.genre_ids?.join(', ')}
            </p>
            <p className="text-muted-foreground mt-2">
                <span className="font-semibold text-white/80">Available in:</span> English, Español
            </p>
        </div>
      </div>

      {similarMovies.length > 0 && (
        <div className="p-10 pt-0">
            <h3 className="text-2xl font-bold mb-4">More Like This</h3>
            <div className="grid grid-cols-3 gap-4">
                {similarMovies.map((similarMovie) => (
                    <div key={similarMovie.id} className="bg-secondary rounded-lg overflow-hidden">
                        <div className="relative aspect-video">
                            <Image src={`${TMDB_IMAGE_BASE_URL}${similarMovie.backdrop_path}`} alt={similarMovie.title || similarMovie.name || ""} fill className="object-cover" />
                             <div className="absolute top-2 right-2">
                                 <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex items-center gap-3 text-sm mb-2">
                                <span className="text-green-400 font-semibold">{(similarMovie.vote_average * 10).toFixed(0)}% Match</span>
                                <span className="border px-1 text-xs">16+</span>
                                <span>{similarMovie.release_date?.substring(0,4)}</span>
                            </div>
                            <p className="text-xs text-white/80 line-clamp-3">
                                {similarMovie.overview}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default MovieModal;
