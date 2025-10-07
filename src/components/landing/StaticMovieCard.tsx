
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/types';
import { TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import { usePathname } from 'next/navigation';

interface StaticMovieCardProps {
  movie: Movie;
}

export default function StaticMovieCard({ movie }: StaticMovieCardProps) {
  const pathname = usePathname();
  const posterUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
    : `https://picsum.photos/seed/${movie.id}/300/168`;

  // If we are on the landing page, link to the showcase.
  // If we are already on the showcase, link to registration.
  const linkHref = pathname === '/' ? '/only-on-streamclone' : '/signup/registration';

  return (
    <Link href={linkHref}>
      <div className="group relative aspect-video bg-zinc-900 rounded-md transition-transform duration-300 ease-out will-change-transform cursor-pointer overflow-hidden">
        <Image
          src={posterUrl}
          alt={movie.title || movie.name || "Movie poster"}
          width={300}
          height={168}
          className="object-cover rounded-md w-full h-full group-hover:scale-105 transition-transform"
          priority
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
      </div>
    </Link>
  );
}
