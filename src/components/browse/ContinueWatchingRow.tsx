
"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ContinueWatchingCard from "./ContinueWatchingCard";
import type { Movie } from "@/types";
import type { WatchHistoryItem } from "@/hooks/useWatchHistory";

interface ContinueWatchingRowProps {
  title: string;
  movies: (Movie & { history: WatchHistoryItem })[];
  onRemove: (id: number) => void;
}

const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ title, movies, onRemove }) => {
  if (movies.length === 0) return null;

  return (
    <div className="pl-4 md:pl-16 relative">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {movies.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2"
            >
              <ContinueWatchingCard movie={movie} historyItem={movie.history} onRemove={onRemove} />
            </CarouselItem>
          ))}
          <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
            <div className="aspect-video" />
          </CarouselItem>
        </CarouselContent>

        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>
    </div>
  );
};

export default ContinueWatchingRow;
