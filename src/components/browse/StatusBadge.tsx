
"use client";

import type { Movie } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

interface StatusBadgeProps {
  movie: Movie;
}

const StatusBadge = ({ movie }: StatusBadgeProps) => {
  const releaseDateStr = movie.release_date || movie.first_air_date;
  if (!releaseDateStr) return null;

  const releaseDate = parseISO(releaseDateStr);
  const daysSinceRelease = differenceInDays(new Date(), releaseDate);

  let badgeText: string | null = null;

  if (daysSinceRelease >= 0 && daysSinceRelease <= 30) {
    badgeText = "New";
  }

  // Future logic can be added here for "New Season", "Leaving Soon", etc.

  if (!badgeText) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-sm z-10">
      {badgeText}
    </div>
  );
};

export default StatusBadge;
