

"use client";

import { useEffect, useState, Suspense } from 'react';
import VideoPlayer from '@/components/watch/VideoPlayer';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import { useParams, useSearchParams } from 'next/navigation';
import type { Movie } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getStream } from '@/lib/stream';
import type { Stream } from '@p-stream/providers';

function WatchPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [mediaDetails, setMediaDetails] = useState<Movie | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaId = parseInt(params.id as string, 10);
  const season = searchParams.get('season') ? parseInt(searchParams.get('season') as string, 10) : undefined;
  const episode = searchParams.get('episode') ? parseInt(searchParams.get('episode') as string, 10) : undefined;


  useEffect(() => {
    if (isNaN(mediaId)) {
      setError("Invalid ID");
      setLoading(false);
      return;
    }

    const fetchDetailsAndStream = async () => {
      setLoading(true);
      try {
        const details = await getMovieOrTvDetails(mediaId);
        if (details) {
          setMediaDetails(details);
          const streamData = await getStream(details, season, episode);
          if (streamData) {
            setStream(streamData);
          } else {
            setError("No video source found for this title.");
          }
        } else {
          setError("Media not found");
        }
      } catch (err) {
          console.error("Error fetching details or stream:", err);
          setError("An error occurred while trying to load the video.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndStream();
  }, [mediaId, season, episode]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
          <LoadingSpinner label="Finding video source..."/>
      </div>
    );
  }

  if (error || !mediaDetails) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Playback Error</h1>
            <p className="text-lg text-muted-foreground">{error || "Could not load video details."}</p>
        </div>
    )
  }
  
  if (!stream) {
     return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Video Source Not Available</h1>
            <p className="text-lg text-muted-foreground">We could not find a playable source for this title at the moment.</p>
        </div>
    )
  }

  // We should pick the highest quality, but for now we'll just pick the first one
  const videoUrl = stream.qualities[Object.keys(stream.qualities)[0]]?.url;

  if (!videoUrl) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Video Source Not Available</h1>
            <p className="text-lg text-muted-foreground">The stream data is incomplete and cannot be played.</p>
        </div>
    )
  }

  return (
    <VideoPlayer
      src={videoUrl}
      media={mediaDetails}
    />
  );
}

export default function WatchPage() {
    return (
        <Suspense fallback={<div className="flex flex-col items-center justify-center h-screen bg-black"><LoadingSpinner label="Loading player..."/></div>}>
            <WatchPageContent />
        </Suspense>
    );
}

