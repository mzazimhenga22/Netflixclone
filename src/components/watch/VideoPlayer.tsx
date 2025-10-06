"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react'; // Keep for back button

// Custom Netflix-style SVG Icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 4l15 8-15 8z"></path>
  </svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 4h4v16H6zM14 4h4v16h-4z"></path>
  </svg>
);

const VolumeHighIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
  </svg>
);

const VolumeMediumIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" opacity="0.3"></path>
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"></path>
    </svg>
);


const VolumeMutedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
  </svg>
);

const FullscreenEnterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 14H5v5h5v-2H7v-3zM5 10h2V7h3V5H5v5zm12 4h-2v3h-3v2h5v-5zM14 5v2h3v3h2V5h-5z"/>
    </svg>
);

const FullscreenExitIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 14H5v5h5v-5zM14 5h5v5h-5V5zM19 14v5h-5v-5h5zM5 10V5h5v5H5z"/>
    </svg>
);

const CaptionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM6 12h2v2H6v-2zm8 6H6v-2h8v2zm0-4H6v-2h8v2z"></path>
    </svg>
);

const NextEpisodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
    </svg>
);

const Rewind10Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.5 3C7.25 3 3 7.25 3 12.5S7.25 22 12.5 22 22 17.75 22 12.5 17.75 3 12.5 3zm-2.2 13.8v-3.4H8.2v-2.8h2.1V7.2h2.2v3.4h.9l-2.1 4.2h-1v2z"></path>
    </svg>
);

const Forward10Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.5 3C7.25 3 3 7.25 3 12.5S7.25 22 12.5 22 22 17.75 22 12.5 17.75 3 12.5 3zm4.2 13.8h-1v-2l-2.1-4.2h.9V7.2h2.2v3.4h2.1v2.8h-2.1v3.4z"></path>
    </svg>
);


interface VideoPlayerProps {
  src: string;
  title: string;
  description?: string;
}

export default function VideoPlayer({ src, title, description }: VideoPlayerProps) {
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
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration || 0);
    const handlePlay = () => {
      setIsPlaying(true);
      resetControlsTimeout();
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

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
    if (!player) return;
    const handleMouseMove = () => resetControlsTimeout();
    player.addEventListener('mousemove', handleMouseMove);
    return () => {
      player.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resetControlsTimeout]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      e.preventDefault();
      if (e.code === 'Space') togglePlay();
      else if (e.key === 'ArrowLeft') handleSeekRelative(-10);
      else if (e.key === 'ArrowRight') handleSeekRelative(10);
      else if (e.key === 'ArrowUp') handleVolumeChange([Math.min(1, volume + 0.1)]);
      else if (e.key === 'ArrowDown') handleVolumeChange([Math.max(0, volume - 0.1)]);
      else if (e.key.toLowerCase() === 'f') toggleFullscreen();
      else if (e.key.toLowerCase() === 'm') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [volume, isMuted, duration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
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
      resetControlsTimeout();
    }
  };
  
  const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      const newMuted = !video.muted;
      video.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) {
          handleVolumeChange([0.5]);
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
      if (newVolume === 0 && !videoRef.current.muted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeMutedIcon : volume < 0.5 ? VolumeMediumIcon : VolumeHighIcon;

  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={playerRef}
      className="w-full h-screen bg-black flex justify-center items-center relative select-none overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        autoPlay
        onDoubleClick={toggleFullscreen}
      />

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300 z-10',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); router.back(); }}
          className="absolute top-5 left-5 text-white h-12 w-12 z-20"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs w-14 text-center">{formatTime(progress)}</span>
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full cursor-pointer [&_span:first-child>span]:bg-primary"
            />
            <span className="text-xs w-14 text-center">{formatTime(duration)}</span>
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-1 md:gap-3">
              <Button variant="ghost" size="icon" className="h-12 w-12">
                {isPlaying ? <PauseIcon className="h-7 w-7" /> : <PlayIcon className="h-7 w-7" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSeekRelative(-10); }} className="h-12 w-12">
                <Rewind10Icon className="h-7 w-7" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSeekRelative(10); }} className="h-12 w-12">
                <Forward10Icon className="h-7 w-7" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="h-12 w-12">
                    <VolumeIcon className="h-6 w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-auto p-0 bg-transparent border-none mb-2" onClick={(e) => e.stopPropagation()}>
                    <div className='bg-black/60 p-4 rounded-lg'>
                        <Slider
                            orientation="vertical"
                            value={[isMuted ? 0 : volume]}
                            max={1}
                            step={0.05}
                            onValueChange={handleVolumeChange}
                            className="h-24 w-2"
                        />
                    </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="text-white text-base md:text-xl font-bold truncate px-4 flex-1 text-center invisible md:visible">
              {title}
            </div>

            <div className="flex items-center gap-1 md:gap-3">
               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="h-12 w-12">
                <NextEpisodeIcon className="h-7 w-7" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="h-12 w-12">
                <CaptionsIcon className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); toggleFullscreen(); }} className="h-12 w-12">
                {isFullscreen ? <FullscreenExitIcon className="h-6 w-6" /> : <FullscreenEnterIcon className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    