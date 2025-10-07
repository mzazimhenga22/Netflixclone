
"use client";

import React from "react";
import Image from "next/image";
import Link from 'next/link';
import { Play, MoreVertical, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/types";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import type { WatchHistoryItem } from "@/hooks/useWatchHistory";

interface ContinueWatchingCardProps {
  movie: Movie;
  historyItem: WatchHistoryItem;
  onRemove: (id: number) => void;
}

export default function ContinueWatchingCard({ movie, historyItem, onRemove }: ContinueWatchingCardProps) {
  const posterUrl = movie.backdrop_path 
    ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
    : `https://picsum.photos/seed/${movie.id}/300/168`;

  const progressPercentage = (historyItem.progress / historyItem.duration) * 100;

  return (
    <div className="group relative aspect-video bg-zinc-900 rounded-md overflow-hidden cursor-pointer">
      <Link href={`/watch/${movie.id}`}>
        <Image
          src={posterUrl}
          alt={movie.title || movie.name || "Movie poster"}
          width={300}
          height={168}
          className="object-cover rounded-md w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
        
        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 bg-black/50 rounded-full flex items-center justify-center border-2 border-white/80 transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div className="h-full bg-primary" style={{ width: `${progressPercentage}%` }} />
        </div>
      </Link>
      
      {/* Bottom Info and Menu */}
      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
         <div className="text-white text-shadow-lg">
            <h3 className="font-bold text-sm truncate max-w-[180px]">{movie.title || movie.name}</h3>
         </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuItem onClick={() => onRemove(movie.mediaId)} className="cursor-pointer">
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>Remove from row</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
