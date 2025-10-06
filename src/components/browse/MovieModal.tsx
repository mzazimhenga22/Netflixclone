
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Play, ThumbsUp, Volume2, X } from 'lucide-react';
import { movieCategories } from '@/lib/data';
import type { Movie } from '@/types';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

const similarMovies = movieCategories.find(cat => cat.title === "Trending Now")?.movies.slice(0, 3) || [];

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  return (
    <div className="text-white">
      <div className="relative aspect-video">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover rounded-t-lg"
          data-ai-hint={movie.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
            <Button size="icon" variant="ghost" onClick={onClose} className="h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70">
              <X className="h-6 w-6" />
            </Button>
        </div>
        <div className="absolute bottom-10 left-10">
          <h2 className="text-4xl font-black mb-4">{movie.title}</h2>
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
            <span className="text-green-400 font-semibold">97% Match</span>
            <span>2024</span>
            <span className="border px-1.5 text-sm">16+</span>
            <span>2h 31m</span>
            <span className="border px-1.5 text-sm">HD</span>
          </div>
          <p className="text-lg">
            In the continuing saga of the Corleone crime family, a young Vito Corleone grows up in Sicily and in 1910s New York. In the 1950s, Michael Corleone attempts to expand the family business into Las Vegas,...
          </p>
        </div>
        <div className="text-sm">
            <p className="text-muted-foreground">
                <span className="font-semibold text-white/80">Genres:</span> Drama, Crime
            </p>
            <p className="text-muted-foreground mt-2">
                <span className="font-semibold text-white/80">Available in:</span> English, Italiano, Latin, Español
            </p>
        </div>
      </div>

      <div className="p-10 pt-0">
        <h3 className="text-2xl font-bold mb-4">More Like This</h3>
        <div className="grid grid-cols-3 gap-4">
          {similarMovies.map((similarMovie) => (
            <div key={similarMovie.id} className="bg-secondary rounded-lg overflow-hidden">
                <div className="relative aspect-video">
                    <Image src={similarMovie.posterUrl} alt={similarMovie.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                         <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="p-3">
                    <div className="flex items-center gap-3 text-sm mb-2">
                        <span className="text-green-400 font-semibold">85% Match</span>
                        <span className="border px-1 text-xs">16+</span>
                        <span>1993</span>
                    </div>
                    <p className="text-xs text-white/80">
                        A young street hustler attempts to escape the rigors and temptations of the ghetto in a quest for a better life.
                    </p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
