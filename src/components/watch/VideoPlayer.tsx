
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import type { Movie } from '@/types';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';


// Custom Netflix-style SVG Icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 4l15 8-15 8z"></path></svg>
);
const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 4h4v16H6zM14 4h4v16h-4z"></path></svg>
);
const VolumeHighIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" fill="currentColor" {...props}><path d="M25.33 2.022H22.7a.7.7 0 0 0-.7.7v28.556a.7.7 0 0 0 .7.7h2.63a.7.7 0 0 0 .7-.7V2.722a.7.7 0 0 0-.7-.7ZM13.3 2.022H10.67a.7.7 0 0 0-.7.7v28.556a.7.7 0 0 0 .7.7H13.3a.7.7 0 0 0 .7-.7V2.722a.7.7 0 0 0-.7-.7Z"></path></svg>
);
const VolumeMutedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" fill="currentColor" {...props}><path d="m21.43 31.83-8.62-6.53H8.22V10.7h4.59l8.62-6.53Zm-1.8-21.14-5.4 4.08H9.92v6.8h4.31l5.4 4.09Zm10.45 6.13a.9.9 0 0 0-1.28 1.28 5.78 5.78 0 0 1 0 9.2 1 1 0 0 0 .64 1.76.94.94 0 0 0 .64-.24 8.13 8.13 0 0 0 0-12Zm3.48-3.48a.9.9 0 0 0-1.28 1.28 9.51 9.51 0 0 1 0 16.36 1 1 0 0 0 .64 1.76.93.93 0 0 0 .64-.24 11.42 11.42 0 0 0 0-19.16Z"></path></svg>
);
const FullscreenEnterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" fill="currentColor" {...props}><path d="M31.5 8H28V4.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v4H19a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h4v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5V8.5a.5.5 0 0 0-.5-.5Zm-2 7h-3V9h3v6Zm-15.5-3H11V8.5a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0-.5.5V12h3.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5H5V9h5v5H8.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5ZM13 23.5a.5.5 0 0 0-.5.5V28H8.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5H12v-3.5a.5.5 0 0 0-.5-.5h-3v-5h3.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5H4.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5H8v-3.5a.5.5 0 0 0-.5-.5h-3V21h10v3.5a.5.5 0 0 0 .5.5ZM27.5 20h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5H27v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5V24h-3.5a.5.5 0 0 0-.5.5v3h-5v-5h1.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5H20v-3.5a.5.5 0 0 0-.5-.5h-3V21h10v6h-3v-3.5a.5.5 0 0 0-.5-.5Z"></path></svg>
);
const FullscreenExitIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" fill="currentColor" {...props}><path d="M4.5 12.5h4a.5.5 0 0 0 .5-.5V8.5a.5.5 0 0 0-.5-.5H4a.5.5 0 0 0-.5.5v4.5a.5.5 0 0 0 .5.5Zm1-4h3v3h-3v-3Zm26 0h3v3h-3v-3ZM28 8h.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h4ZM4.5 28.5h4a.5.5 0 0 0 .5-.5v-3.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v3.5a.5.5 0 0 0 .5.5Zm1-4h3v3h-3v-3Zm25-1v3h-3v-3h3Zm-4-1h4.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5Z"></path></svg>
);
const Rewind10Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.5 3C7.8 3 3.5 6.3 3.5 11c0 2.8 1.7 5.3 4.2 6.5l-1.5 1.5c-3-1.5-5.2-4.5-5.2-8C1 5.2 5.9 1 12.5 1c5.2 0 9.6 3.3 11.2 7.8l-1.5 1.5C20.8 6.3 17 3 12.5 3z M10.5 10V7h-2v3.5L12 12V10h-1.5z M16.5 10h-3V7h-2v5h5V10z"></path></svg>
);
const Forward10Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.5 3C7.8 3 3.5 6.3 3.5 11c0 2.8 1.7 5.3 4.2 6.5l-1.5 1.5c-3-1.5-5.2-4.5-5.2-8C1 5.2 5.9 1 12.5 1c5.2 0 9.6 3.3 11.2 7.8l-1.5 1.5C20.8 6.3 17 3 12.5 3z M10.5 10V7h-2v3.5L12 12V10h-1.5z M16.5 10h-3V7h-2v5h5V10z" transform="scale(-1, 1) translate(-24, 0)"></path></svg>
);
const CaptionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" fill="currentColor" {...props}><path d="M29.13 22.13H6.87a.88.88 0 0 0-.87.88v5.12a.88.88 0 0 0 .87.88h22.26a.88.88 0 0 0 .87-.88v-5.12a.88.88 0 0 0-.87-.88Zm-1 4.25h-6.19v-2.5h6.19Zm-8.7-2.5h6.2v2.5h-6.2Zm-8.67 0h6.19v2.5H10.76Z"></path></svg>
);
const EpisodesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 13V2l-4 4 4 4M20 22h-8M20 18h-8M20 14h-8M4 22h2M4 18h2M4 14h2"/></svg>
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isEpisodesPanelOpen, setIsEpisodesPanelOpen] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const infoTimeoutRef = useRef<number | null>(null);
  const { updateWatchHistory } = useWatchHistory();

  const isTvShow = media.media_type === 'tv';

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress(currentTime);
      if (!isNaN(duration)) {
        setDuration(duration);
      }
      updateWatchHistory(media.id, currentTime, duration, media.media_type);
    }
  }, [media.id, media.media_type, updateWatchHistory]);


  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        video.volume = volume;
        video.muted = isMuted;
        video.addEventListener('timeupdate', handleProgress);
        video.addEventListener('loadedmetadata', () => {
            if (videoRef.current) setDuration(videoRef.current.duration);
        });

        // Set initial state
        setIsPlaying(!video.paused);
        setIsMuted(video.muted);
        setVolume(video.volume);
    }
    return () => {
      video?.removeEventListener('timeupdate', handleProgress);
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
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        setShowInfo(false);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        infoTimeoutRef.current = window.setTimeout(() => setShowInfo(true), 2000);
      }
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
        const newTime = value[0];
        videoRef.current.currentTime = newTime;
        setProgress(newTime);
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
        videoRef.current.volume = 0.5;
        setVolume(0.5);
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
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Sheet open={isEpisodesPanelOpen} onOpenChange={setIsEpisodesPanelOpen}>
      <div ref={playerRef} className={cn("w-full h-screen bg-black flex justify-center items-center relative select-none overflow-hidden", showControls ? "cursor-auto" : "cursor-none")} onDoubleClick={toggleFullscreen}>
        <video ref={videoRef} src={src} className="w-full h-full object-contain" autoPlay muted onClick={togglePlay}/>
        
        {/* Dimmer & Info Overlay */}
        <div className={cn("absolute inset-0 bg-black/40 transition-opacity duration-500", isPlaying || !showInfo ? 'opacity-0' : 'opacity-100', showControls && 'opacity-0', 'pointer-events-none')}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <h1 className="text-4xl font-bold">{media.title || media.name}</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl line-clamp-3">{media.overview}</p>
            </div>
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
            {/* Progress Bar */}
            <div className="flex items-center gap-4 text-sm font-semibold">
                <span className="w-14 text-right">{formatTime(progress)}</span>
                 <Slider
                    defaultValue={[0]}
                    value={[progress]}
                    max={duration || 1}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                />
                <span className="w-14">{formatTime(duration)}</span>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-6">
                    <button onClick={togglePlay} className="text-white h-7 w-7">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                     <div className="flex items-center gap-4">
                        <button onClick={() => skip(-10)} className="text-white h-7 w-7">
                            <Rewind10Icon />
                        </button>
                        <button onClick={() => skip(10)} className="text-white h-7 w-7">
                            <Forward10Icon />
                        </button>
                    </div>
                     <div className="flex items-center gap-2 group">
                        <button onClick={toggleMute} className="text-white h-7 w-7">
                            {isMuted || volume === 0 ? <VolumeMutedIcon /> : <VolumeHighIcon />}
                        </button>
                        <div className="w-24 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Slider 
                                defaultValue={[volume]} 
                                value={[volume]}
                                max={1}
                                step={0.1}
                                onValueChange={handleVolumeChange} 
                           />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {isTvShow && (
                         <SheetTrigger asChild>
                            <button className="text-white h-7 w-7"><EpisodesIcon /></button>
                        </SheetTrigger>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-white h-7 w-7"><CaptionsIcon /></button>
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
                        {document.fullscreenElement ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
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
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center p-2 rounded-md hover:bg-white/10 cursor-pointer gap-4">
              <span className="text-xl text-muted-foreground font-bold w-8 text-center">{index + 1}</span>
              <div className="relative w-40 h-20 rounded-md overflow-hidden flex-shrink-0">
                <Image src={`https://picsum.photos/seed/ep${index + (media.id || 0)}/320/180`} alt={`Episode ${index+1}`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <h4 className="font-bold">Episode {index + 1}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  As a crisis looms, the group must make a difficult choice. A surprising ally emerges.
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
