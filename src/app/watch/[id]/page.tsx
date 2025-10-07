
"use client";

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/watch/VideoPlayer';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import { notFound, useParams } from 'next/navigation';
import type { Movie } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function WatchPage() {
  const params = useParams();
  const [mediaDetails, setMediaDetails] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaId = parseInt(params.id as string, 10);

  useEffect(() => {
    if (isNaN(mediaId)) {
      setError("Invalid ID");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      const details: Movie | null = await getMovieOrTvDetails(mediaId);
      if (details) {
        setMediaDetails(details);
      } else {
        setError("Media not found");
      }
      setLoading(false);
    };

    fetchDetails();
  }, [mediaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
          <LoadingSpinner />
      </div>
    );
  }

  if (error || !mediaDetails) {
    notFound();
  }

  // A placeholder video URL
  const videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <VideoPlayer
      src={videoUrl}
      media={mediaDetails}
    />
  );
}
