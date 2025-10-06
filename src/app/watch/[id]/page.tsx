
import VideoPlayer from '@/components/watch/VideoPlayer';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import { notFound } from 'next/navigation';

export default async function WatchPage({ params }: { params: { id: string } }) {
  const mediaId = parseInt(params.id, 10);
  if (isNaN(mediaId)) {
    notFound();
  }

  // This fetch is for getting the title, but the player will use a placeholder video.
  // In a real app, you might fetch video stream URLs here.
  const mediaDetails = await getMovieOrTvDetails(mediaId);

  // A placeholder video URL
  const videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const title = mediaDetails?.title || mediaDetails?.name || 'Loading...';

  return (
    <VideoPlayer
      src={videoUrl}
      title={title}
    />
  );
}
