
"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import StaticMovieCard from "./StaticMovieCard";
import type { Movie } from "@/types";

interface StaticMovieRowProps {
  title: string;
  movies: Movie[];
}

const StaticMovieRow: React.FC<StaticMovieRowProps> = ({ title, movies }) => {
  const validMovies = movies.filter(movie => movie.backdrop_path);

  if (validMovies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-16 relative group">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {validMovies.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2"
            >
              <StaticMovieCard movie={movie} />
            </CarouselItem>
          ))}
          <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
            <div className="aspect-video" />
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

export default StaticMovieRow;
