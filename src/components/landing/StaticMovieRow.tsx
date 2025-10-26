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
  const validMovies = movies.filter((movie) => movie.backdrop_path);

  if (validMovies.length === 0) return null;

  return (
    <section className="relative group py-6">
      {/* Section Title */}
      <h2 className="text-xl md:text-2xl font-bold mb-4 px-4 md:px-16 text-white">
        {title}
      </h2>

      {/* Carousel */}
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-8">
          {validMovies.map((movie, index) => (
            <CarouselItem
              key={movie.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 pl-4 md:pl-8"
            >
              <StaticMovieCard movie={movie} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows */}
        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Carousel>
    </section>
  );
};

export default StaticMovieRow;
