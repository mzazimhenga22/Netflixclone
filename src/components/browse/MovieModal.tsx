
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Play, ThumbsUp, Volume2, X, Check } from 'lucide-react';
import type { Movie } from '@/types';
import { getSimilar, TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import { useEffect, useState } from 'react';
import { genres } from '@/lib/genres';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMyList } from '@/hooks/useMyList';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const isTvShow = movie.media_type === 'tv' || !movie.release_date;
  const { myList, toggleMyList } = useMyList();
  const isInList = myList.includes(movie.id);

  useEffect(() => {
    const fetchSimilar = async () => {
      const similar = await getSimilar(movie.id, movie.media_type);
      setSimilarMovies(similar.slice(0, 9)); // Get top 9 similar titles
    };

    fetchSimilar();
  }, [movie.id, movie.media_type]);

  const posterUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
    : `https://picsum.photos/seed/${movie.id}/1280/720`;
  
  const movieYear = movie.release_date?.substring(0, 4) || movie.first_air_date?.substring(0,4);
  
  const getGenreNames = (ids?: number[]) => {
    if (!ids) return '';
    return ids.map(id => genres[id]).filter(Boolean).join(', ');
  }

  const episodesPlaceholder = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Episode ${i + 1}`,
    description: "As a crisis looms, the group must make a difficult choice. A surprising ally emerges, but can they be trusted?",
    thumbnail: `https://picsum.photos/seed/ep${i + movie.id}/320/180`,
  }));

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMyList(movie);
  };

  const handleSimilarToggleList = (e: React.MouseEvent, similarMovie: Movie) => {
    e.stopPropagation();
    toggleMyList(similarMovie);
  };

  return (
    <div className="text-white">
      <div className="relative aspect-video">
        <Image
          src={posterUrl}
          alt={movie.title || movie.name || "Movie poster"}
          fill
          className="object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
            <Button size="icon" variant="ghost" onClick={onClose} className="h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70">
              <X className="h-6 w-6" />
            </Button>
        </div>
        <div className="absolute bottom-10 left-10">
          <h2 className="text-4xl font-black mb-4">{movie.title || movie.name}</h2>
          <div className="flex items-center gap-2">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/80 font-bold text-lg">
              <Link href={`/watch/${movie.id}`}>
                <Play className="mr-2 h-7 w-7" /> Play
              </Link>
            </Button>
            <Button onClick={handleToggleList} size="icon" variant="outline" className="h-11 w-11 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
              {isInList ? <Check className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
            </Button>
            <Button size="icon" variant="outline" className="h-11 w-11 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
              <ThumbsUp className="h-7 w-7" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-12 right-10">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-2 border-white/40 bg-black/30 text-white hover:border-white hover:bg-black/50">
                <Volume2 className="h-6 w-6" />
            </Button>
        </div>
      </div>
      <div className="p-10 grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-3 text-base mb-4">
            <span className="text-green-400 font-semibold">{(movie.vote_average * 10).toFixed(0)}% Match</span>
            <span>{movieYear}</span>
            <span className="border px-1.5 text-sm">16+</span>
            <span className="border px-1.5 text-sm">HD</span>
          </div>
          <p className="text-lg line-clamp-4">
            {movie.overview}
          </p>
        </div>
        <div className="text-sm">
            <p className="text-muted-foreground">
                <span className="font-semibold text-white/80">Genres:</span> {getGenreNames(movie.genre_ids)}
            </p>
            <p className="text-muted-foreground mt-2">
                <span className="font-semibold text-white/80">Available in:</span> English, Español
            </p>
        </div>
      </div>

       {isTvShow && (
        <div className="p-10 pt-0 border-b border-secondary">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Episodes</h3>
             <Select defaultValue="season1">
                <SelectTrigger className="w-[180px] bg-secondary border-secondary-foreground/20">
                    <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="season1">Season 1</SelectItem>
                    <SelectItem value="season2">Season 2</SelectItem>
                    <SelectItem value="season3">Season 3</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {episodesPlaceholder.map((ep, index) => (
              <div key={ep.id} className="flex items-center p-2 rounded-md hover:bg-secondary cursor-pointer gap-4">
                <span className="text-xl text-muted-foreground font-bold w-8 text-center">{index + 1}</span>
                <div className="relative w-40 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={ep.thumbnail} alt={ep.title} fill className="object-cover" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                    </div>
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold">{ep.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ep.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {similarMovies.length > 0 && (
        <div className="p-10">
            <h3 className="text-2xl font-bold mb-4">More Like This</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {similarMovies.map((similarMovie) => (
                    <div key={similarMovie.id} className="bg-secondary rounded-lg overflow-hidden group">
                        <div className="relative aspect-video">
                            <Image src={`${TMDB_IMAGE_BASE_URL}${similarMovie.backdrop_path}`} alt={similarMovie.title || similarMovie.name || ""} fill className="object-cover" />
                             <div className="absolute top-2 right-2 z-10">
                                 <Button onClick={(e) => handleSimilarToggleList(e, similarMovie)} size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/50 text-white bg-black/50 hover:border-white hover:bg-black/70">
                                    {myList.includes(similarMovie.id) ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 p-2 bg-gradient-to-t from-black/80 to-transparent w-full">
                               <h4 className="font-bold truncate">{similarMovie.title || similarMovie.name}</h4>
                            </div>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-400 font-semibold">{(similarMovie.vote_average * 10).toFixed(0)}% Match</span>
                                <span className="border px-1 text-xs">16+</span>
                                <span>{similarMovie.release_date?.substring(0,4) || similarMovie.first_air_date?.substring(0,4)}</span>
                            </div>
                            <p className="text-xs text-white/80 line-clamp-3">
                                {similarMovie.overview}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default MovieModal;
