import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Info, Play } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const Banner = () => {
  const bannerImage = PlaceHolderImages.find(p => p.id === 'browse-banner');

  return (
    <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
      {bannerImage && (
        <Image
          src={bannerImage.imageUrl}
          alt={bannerImage.description}
          fill
          className="object-cover"
          data-ai-hint={bannerImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent" />

      <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-16 space-y-2 md:space-y-4 max-w-lg z-10">
        <h1 className="text-2xl md:text-5xl lg:text-6xl font-black">
          Movie Title of the Banner
        </h1>
        <p className="hidden md:block text-sm md:text-base max-w-md text-white/90">
          This is a short and compelling description of the movie or show. It's captivating and makes you want to watch it right away.
        </p>
        <div className="flex items-center space-x-3">
          <Button size="lg" className="bg-white text-black hover:bg-white/80 font-bold">
            <Play className="mr-2 h-6 w-6" /> Play
          </Button>
          <Button size="lg" className="bg-gray-500/70 text-white hover:bg-gray-500/50 backdrop-blur-sm font-bold">
            <Info className="mr-2 h-6 w-6" /> More Info
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
