// components/MovieRow.tsx
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MovieCard from "./MovieCard";
import type { Movie } from "@/types";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies }) => {
  // Filter out movies that don't have a poster image
  const validMovies = movies.filter(movie => movie.backdrop_path);

  if (validMovies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-16 relative group z-10 hover:z-20"> {/* allow overlays to escape */}
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        {/* ensure carousel content doesn't clip children */}
        <CarouselContent className="-ml-2">
          {validMovies.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2"
            >
              <MovieCard movie={movie} />
            </CarouselItem>
          ))}

          {/* optional spacer to help with snapping / end padding */}
          <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
            <div className="aspect-video" />
          </CarouselItem>
        </CarouselContent>

        {/* navigation buttons (hidden on small screens) */}
        <div className="hidden md:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
};

export default MovieRow;
