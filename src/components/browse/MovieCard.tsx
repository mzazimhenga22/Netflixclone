"use client"
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Play, ChevronDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

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
    const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
        className="group relative aspect-[2/3] transition-transform duration-300 ease-in-out md:hover:scale-125 md:hover:z-20 md:hover:-translate-y-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={movie.posterUrl}
        alt={movie.title}
        width={300}
        height={450}
        className="object-cover rounded-md w-full h-full"
        data-ai-hint={movie.imageHint}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-md"
        style={{ transform: 'scale(0.8)', transformOrigin: 'bottom', visibility: isHovered ? 'visible' : 'hidden' }}
      >
        <div className="mt-16">
            <h3 className="text-sm font-bold truncate">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-2">
                <Button size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/80">
                    <Play className="h-4 w-4 ml-0.5" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                    <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70 ml-auto">
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2 text-white/80">
                <span>98% Match</span>
                <span className="border p-0.5 text-[10px]">16+</span>
                <span>2h 15m</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
