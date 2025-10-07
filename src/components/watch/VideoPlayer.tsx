
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, RotateCw, Captions, Layers, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import Image from 'next/image';
import type { Movie } from '@/types';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import NetflixProgress from './NetflixProgress';
import { Slider } from '@/components/ui/slider';
import PauseDetailsOverlay from './PauseDetailsOverlay';
import Link from 'next/link';


// Custom Netflix-style SVG Icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 4l15 8-15 8z"></path></svg>
);
const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 4h4v16H6zM14 4h4v16h-4z"></path></svg>
);


interface VideoPlayerProps {
  src: string;
  media: Movie;
}

export default function VideoPlayer({ src, media }: VideoPlayerProps) {
  const router = useRouter();
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(true);
  const [isEpisodesPanelOpen, setIsEpisodesPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const { updateWatchHistory } = useWatchHistory();

  const isTvShow = media.media_type === 'tv';

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) { // Only update if duration is valid
        updateWatchHistory(media, currentTime, duration);
      }
    }
  }, [media, updateWatchHistory]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
	if (typeof document !== 'undefined') {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => {
		document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	}
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        // Attempt to play on mount, will be muted
        video.play().catch(error => console.error("Autoplay was prevented:", error));

        video.volume = volume;
        video.muted = isMuted;
        video.addEventListener('timeupdate', handleProgress);
        
        const updatePlayingState = () => setIsPlaying(!video.paused);
        video.addEventListener('play', updatePlayingState);
        video.addEventListener('pause', updatePlayingState);

        // Set initial state
        setIsPlaying(!video.paused);
        setIsMuted(video.muted);
        setVolume(video.volume);
    }
    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleProgress);
        const updatePlayingState = () => setIsPlaying(!video.paused);
        video.removeEventListener('play', updatePlayingState);
        video.removeEventListener('pause', updatePlayingState);
      }
    };
  }, [handleProgress, isMuted, volume]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 4000);
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    const handleMouseMove = () => resetControlsTimeout();
    player?.addEventListener('mousemove', handleMouseMove);
    resetControlsTimeout(); // Initial timeout
    return () => {
      player?.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  
  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && videoRef.current.volume === 0) {
        const newVolume = 0.5;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
      if (videoRef.current) {
          const newVolume = value[0];
          videoRef.current.volume = newVolume;
          setVolume(newVolume);
          if (newVolume > 0 && isMuted) {
              videoRef.current.muted = false;
              setIsMuted(false);
          }
      }
  }

  const toggleFullscreen = () => {
    const elem = playerRef.current;
    if (elem) {
      if (!isFullscreen) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Sheet open={isEpisodesPanelOpen} onOpenChange={setIsEpisodesPanelOpen}>
      <div ref={playerRef} className={cn("w-full h-screen bg-black flex justify-center items-center relative select-none overflow-hidden", showControls ? "cursor-auto" : "cursor-none")} onDoubleClick={toggleFullscreen}>
        <video ref={videoRef} src={src} className="w-full h-full object-contain" autoPlay muted onClick={togglePlay}/>
        
        <PauseDetailsOverlay
          videoRef={videoRef}
          media={media}
          onShowEpisodes={() => setIsEpisodesPanelOpen(true)}
        />

        {/* Center Controls */}
        <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-12 transition-opacity duration-300", !showControls && "opacity-0 pointer-events-none")}>
            <button onClick={() => skip(-10)} className="text-white h-20 w-20 relative flex items-center justify-center">
                <RotateCcw className="h-12 w-12" />
                <span className="absolute text-xs font-bold mt-0.5">10</span>
            </button>
            <button onClick={togglePlay} className="text-white h-20 w-20">
                {isPlaying ? <PauseIcon className="w-full h-full" /> : <PlayIcon className="w-full h-full" />}
            </button>
            <button onClick={() => skip(10)} className="text-white h-20 w-20 relative flex items-center justify-center">
                <RotateCw className="h-12 w-12" />
                <span className="absolute text-xs font-bold mt-0.5">10</span>
            </button>
        </div>

        {/* Top Controls */}
        <div className={cn("absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-transform duration-300", !showControls && "-translate-y-full")}>
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="text-white hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-8 w-8" />
            </button>
            <h2 className="text-xl font-bold">{media.title || media.name}</h2>
            <div>{/* Spacer */}</div>
          </div>
        </div>
        
        {/* Bottom Controls */}
        <div className={cn("absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-transform duration-300", !showControls && "translate-y-full")}>
             <NetflixProgress videoRef={videoRef} />

            {/* Main Controls */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 group">
                    <button onClick={toggleMute} className="text-white h-7 w-7">
                        {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
                    </button>
                    <div className="w-24 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Slider 
                            value={[isMuted ? 0 : volume]}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange} 
                        />
                    </div>
                </div>
                
                <div className="flex-1"></div>
                
                <div className="flex items-center gap-4">
                    {isTvShow && (
                         <SheetTrigger asChild>
                            <button className="text-white h-7 w-7"><Layers /></button>
                        </SheetTrigger>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-white h-7 w-7"><Captions /></button>
                        </PopoverTrigger>
                         <PopoverContent className="w-64 bg-black/80 border-white/20 text-white p-2" align="end">
                            <div className="text-center p-2 border-b border-white/20">Audio & Subtitles</div>
                             <div className="p-2 space-y-2">
                                <label className="block text-sm text-muted-foreground">Audio</label>
                                <Button variant="ghost" className="w-full justify-start">English</Button>
                                <Button variant="ghost" className="w-full justify-start">Español</Button>
                            </div>
                            <div className="p-2 space-y-2">
                                <label className="block text-sm text-muted-foreground">Subtitles</label>
                                <Button variant="ghost" className="w-full justify-start">Off</Button>
                                <Button variant="ghost" className="w-full justify-start">English</Button>
                                <Button variant="ghost" className="w-full justify-start">Español</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <button onClick={toggleFullscreen} className="text-white h-7 w-7">
                        {isFullscreen ? <Minimize /> : <Maximize />}
                    </button>
                </div>
            </div>
        </div>
      </div>
      <SheetContent className="bg-black/90 border-l border-white/20 text-white w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-white/20">
          <SheetTitle>Episodes: {media.name}</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => {
            const episodeNumber = index + 1;
            return (
              <Link
                key={episodeNumber}
                href={`/watch/${media.id}?season=1&episode=${episodeNumber}`}
                className="flex items-center p-2 rounded-md hover:bg-white/10 cursor-pointer gap-4"
              >
                <span className="text-xl text-muted-foreground font-bold w-8 text-center">{episodeNumber}</span>
                <div className="relative w-40 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={`https://picsum.photos/seed/ep${episodeNumber + (media.id || 0)}/320/180`} alt={`Episode ${episodeNumber}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold">Episode {episodeNumber}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    As a crisis looms, the group must make a difficult choice. A surprising ally emerges.
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
