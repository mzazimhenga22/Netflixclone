import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import MovieCard from "./MovieCard";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  imageHint: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

const MovieRow = ({ title, movies }: MovieRowProps) => {
  return (
    <div className="pl-4 md:pl-16 group relative">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {movies.map((movie, index) => (
            <CarouselItem key={movie.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
                <MovieCard movie={movie} />
            </CarouselItem>
          ))}
           <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
              <div className="aspect-video"/>
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

export default MovieRow;