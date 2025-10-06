
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize, ArrowLeft, RotateCcw, RotateCw, Captions, Settings2, GalleryVertical, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  title: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if(videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      resetControlsTimeout();
    };
    const handlePause = () => {
      setIsPlaying(false);
      if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Start with controls visible
    resetControlsTimeout();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
       if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);
  
  useEffect(() => {
    const player = playerRef.current;
    if(!player) return;

    const handleMouseMove = () => resetControlsTimeout();
    player.addEventListener('mousemove', handleMouseMove);

    return () => {
      player.removeEventListener('mousemove', handleMouseMove);
    }

  }, [resetControlsTimeout]);

  const togglePlay = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleSeekRelative = (offset: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + offset));
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if(!newMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };
  
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;


  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;

    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={playerRef} 
      className="w-full h-screen bg-black flex justify-center items-center relative group/player" 
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => { if (controlsTimeoutRef.current && isPlaying) clearTimeout(controlsTimeoutRef.current); setShowControls(true); }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        autoPlay
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />
      <div 
        className={cn(
            "absolute inset-0 transition-opacity duration-300", 
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-5 left-5 md:top-8 md:left-12 z-20">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white h-10 w-10 md:h-12 md:w-12">
            <ArrowLeft className="h-6 w-6 md:h-8 md:w-8" />
          </Button>
        </div>
        
        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20 bg-gradient-to-t from-black/70 to-transparent">
          {/* Progress Bar */}
          <div className="flex items-center gap-4 text-white text-xs font-light">
              <span className="w-12 text-center">{formatTime(progress)}</span>
              <Slider
                  value={[progress]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full cursor-pointer [&>span:first-child>span]:bg-primary"
              />
              <span className="w-12 text-center">{formatTime(duration)}</span>
          </div>

          {/* Control Icons */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1 md:gap-3">
              <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause className="h-6 w-6 md:h-8 md:w-8" /> : <Play className="h-6 w-6 md:h-8 md:w-8" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleSeekRelative(-10)} className="text-white">
                <Rewind className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleSeekRelative(10)} className="text-white">
                <FastForward className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <VolumeIcon className="h-5 w-5 md:h-7 md:w-7" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-black/70 border-none mb-2">
                    <Slider
                      orientation="vertical"
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.05}
                      onValueChange={handleVolumeChange}
                      className="h-24 w-2"
                    />
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-white text-sm md:text-lg font-semibold truncate px-4 flex-1 text-center">
              {title}
            </div>

            <div className="flex items-center gap-1 md:gap-3">
               <Button variant="ghost" size="icon" className="text-white">
                <GalleryVertical className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
               <Button variant="ghost" size="icon" className="text-white">
                <Captions className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
               <Button variant="ghost" size="icon" className="text-white">
                <Settings2 className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <Minimize className="h-6 w-6 md:h-7 md:w-7" /> : <Maximize className="h-6 w-6 md:h-7 md:w-7" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
