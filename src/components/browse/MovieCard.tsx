"use client"
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Play, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  imageHint: string;
}

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="group/item relative aspect-video bg-background rounded-md">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover rounded-md"
          data-ai-hint={movie.imageHint}
        />
      
      {/* Expanded state on hover */}
      <div className="absolute top-0 left-0 right-0 invisible opacity-0 group-hover/item:visible group-hover/item:opacity-100 transition-all duration-500 transform scale-75 group-hover/item:scale-125 group-hover/item:delay-500 origin-bottom shadow-2xl rounded-lg z-50">
        <div className="relative aspect-video w-full">
             <Image
              src={movie.posterUrl}
              alt={`${movie.title} preview`}
              fill
              className="object-cover rounded-t-md"
            />
            <div className="absolute bottom-2 left-3">
                <h3 className="text-white text-lg font-bold drop-shadow-lg">{movie.title}</h3>
            </div>
        </div>
        <div className="p-3 bg-card rounded-b-md">
            <div className="flex items-center gap-2">
                <Button size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/80">
                    <Play className="h-4 w-4 ml-0.5" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                    <ThumbsUp className="h-4 w-4" />
                </Button>
                 <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                    <ThumbsDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70 ml-auto">
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-2 text-xs mt-3 text-white/80">
                <span className="text-green-400 font-semibold">98% Match</span>
                <span className="border px-1 text-[10px]">16+</span>
                <span>2h 15m</span>
            </div>
             <div className="flex items-center gap-2 text-xs mt-2 text-white/80">
                <span>Action</span>
                <span className="text-white/50">•</span>
                <span>Sci-Fi</span>
                <span className="text-white/50">•</span>
                <span>Thriller</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
