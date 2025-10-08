

import VideoPlayer from '@/components/watch/VideoPlayer';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getStream } from '@/lib/stream';
import type { Stream } from '@/providers';

interface WatchPageParams {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function WatchPage({ params, searchParams }: WatchPageParams) {
  const mediaId = parseInt(params.id, 10);
  const season = searchParams.season ? parseInt(searchParams.season as string, 10) : undefined;
  const episode = searchParams.episode ? parseInt(searchParams.episode as string, 10) : undefined;

  if (isNaN(mediaId)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Playback Error</h1>
        <p className="text-lg text-muted-foreground">Invalid media ID provided.</p>
      </div>
    );
  }

  const mediaDetails = await getMovieOrTvDetails(mediaId);

  if (!mediaDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Playback Error</h1>
        <p className="text-lg text-muted-foreground">Could not load media details.</p>
      </div>
    );
  }

  const { stream, error: streamError } = await getStream(mediaDetails, season, episode);

  if (streamError || !stream) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Playback Error</h1>
        <p className="text-lg text-muted-foreground">{streamError || "Could not find a video source."}</p>
      </div>
    );
  }

  let videoUrl: string | undefined;

  if (stream.type === 'hls') {
    videoUrl = stream.playlist;
  } else if (stream.type === 'file') {
    // Take the best quality available, or the first one
    const qualityOrder: Array<keyof Stream['qualities']> = ['4k', '1080', '720', '480', '360', 'unknown'];
    for (const quality of qualityOrder) {
      if (stream.qualities[quality]) {
        videoUrl = stream.qualities[quality]?.url;
        break;
      }
    }
  }


  if (!videoUrl) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Video Source Not Available</h1>
            <p className="text-lg text-muted-foreground">A stream was found, but the data is incomplete or invalid.</p>
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
