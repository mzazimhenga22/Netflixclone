"use client";

import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Top10Card from './Top10Card';
import type { Movie } from '@/types';

interface Top10RowProps {
  title: string;
  movies: Movie[];
}

const Top10Row: React.FC<Top10RowProps> = ({ title, movies }) => {
  const validMovies = movies.filter(movie => movie.poster_path);

  if (validMovies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-16 relative group z-10 hover:z-20">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {validMovies.map((movie, index) => (
            <CarouselItem
              key={movie.id}
              className="pl-4 basis-1/2 sm:basis-[38%] md:basis-1/4 lg:basis-1/5 xl:basis-[18%]"
            >
              <Top10Card movie={movie} rank={index + 1} />
            </CarouselItem>
          ))}
           <CarouselItem className="pl-4 basis-1/6">
            <div className="h-full aspect-[2/3]" />
          </CarouselItem>
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
};

export default Top10Row;
