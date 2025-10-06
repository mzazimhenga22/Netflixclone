
import VideoPlayer from '@/components/watch/VideoPlayer';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import type { Movie } from '@/types';

export default async function WatchPage({ params }: { params: { id: string } }) {
  const mediaId = parseInt(params.id, 10);
  if (isNaN(mediaId)) {
    notFound();
  }

  // Fetch the full details for the movie or TV show.
  const mediaDetails: Movie | null = await getMovieOrTvDetails(mediaId);

  if (!mediaDetails) {
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
