"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import { usePathname } from "next/navigation";

interface StaticMovieCardProps {
  movie: Movie;
  index?: number;
}

export default function StaticMovieCard({ movie, index }: StaticMovieCardProps) {
  const pathname = usePathname();
  const posterUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
    : `https://picsum.photos/seed/${movie.id}/250/375`;

  const linkHref =
    pathname === "/" ? "/only-on-streamclone" : "/signup/registration";

  return (
    <div className="relative group flex items-end">
      {/* Big Rank Number */}
      {typeof index === "number" && (
        <div className="absolute -left-8 bottom-2 z-10">
          <span
            className="
              text-[6rem] font-extrabold leading-none
              text-white
              drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]
            "
            style={{
              WebkitTextStroke: "3px black",
              lineHeight: "0.8",
            }}
          >
            {index + 1}
          </span>
        </div>
      )}

      {/* Card */}
      <Link
        href={linkHref}
        className="
          block relative overflow-hidden rounded-2xl
          w-[170px] h-[240px]
          bg-zinc-900 shadow-lg hover:shadow-2xl
          transform transition-all duration-300 ease-out
          hover:scale-[1.05] cursor-pointer
        "
      >
        <Image
          src={posterUrl}
          alt={movie.title || movie.name || "Movie poster"}
          width={170}
          height={240}
          className="object-cover w-full h-full"
          priority
        />
      </Link>
    </div>
  );
}
