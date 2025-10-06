import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Info, Play, Volume2 } from 'lucide-react';
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
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

      <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 right-4 md:right-auto z-10">
        <div className="max-w-lg">
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-black">
            Movie Title of the Banner
          </h1>
          <p className="hidden md:block text-sm md:text-base max-w-md text-white/90 mt-2 md:mt-4">
            This is a short and compelling description of the movie or show. It's captivating and makes you want to watch it right away.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-6">
          <Button size="lg" className="bg-white text-black hover:bg-white/80 font-bold">
            <Play className="mr-2 h-6 w-6" /> Play
          </Button>
          <Button size="lg" className="bg-gray-500/70 text-white hover:bg-gray-500/50 backdrop-blur-sm font-bold">
            <Info className="mr-2 h-6 w-6" /> More Info
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-[10%] md:bottom-[20%] right-4 md:right-8 z-10 flex items-center space-x-3">
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-2 border-white/40 bg-black/30 text-white hover:border-white hover:bg-black/50">
            <Volume2 className="h-6 w-6" />
        </Button>
        <div className="bg-black/30 border-l-4 border-white/40 px-4 py-2 text-sm font-semibold">
            16+
        </div>
      </div>
    </div>
  );
};

export default Banner;
