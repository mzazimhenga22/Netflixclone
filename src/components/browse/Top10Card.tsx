
"use client";

import Image from 'next/image';
import { TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import type { Movie } from '@/types';

interface Top10CardProps {
  movie: Movie;
  rank: number;
}

const Top10Card = ({ movie, rank }: Top10CardProps) => {
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL.replace('original', 'w500')}${movie.poster_path}`
    : `https://picsum.photos/seed/${movie.id}/400/600`;

  return (
    <div className="group relative flex items-center h-full cursor-pointer">
      <div 
        className="text-[200px] font-black text-transparent transition-transform duration-300 ease-in-out group-hover:scale-105" 
        style={{
            WebkitTextStroke: '2px rgba(120, 120, 120, 0.8)',
            lineHeight: '1',
        }}
      >
        {rank}
      </div>
      <div className="absolute left-8 w-[140px] h-[210px] rounded-md overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110 shadow-lg">
        <Image
          src={posterUrl}
          alt={movie.title || movie.name || 'Movie poster'}
          width={140}
          height={210}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default Top10Card;
