
"use client";

import type { Movie } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

interface StatusBadgeProps {
  movie: Movie;
}

const StatusBadge = ({ movie }: StatusBadgeProps) => {
  let badgeText: string | null = null;

  // Check for "New Season" first for TV shows
  if (movie.media_type === 'tv' && movie.last_air_date) {
    const lastAirDate = parseISO(movie.last_air_date);
    const daysSinceLastAir = differenceInDays(new Date(), lastAirDate);
    if (daysSinceLastAir >= 0 && daysSinceLastAir <= 60) { // New season if last episode aired recently
      badgeText = "New Season";
    }
  }

  // If not a new season, check if it's just "New"
  if (!badgeText) {
    const releaseDateStr = movie.release_date || movie.first_air_date;
    if (releaseDateStr) {
        const releaseDate = parseISO(releaseDateStr);
        const daysSinceRelease = differenceInDays(new Date(), releaseDate);
        if (daysSinceRelease >= 0 && daysSinceRelease <= 30) {
            badgeText = "New";
        }
    }
  }


  if (!badgeText) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-sm z-10">
      {badgeText}
    </div>
  );
};

export default StatusBadge;
