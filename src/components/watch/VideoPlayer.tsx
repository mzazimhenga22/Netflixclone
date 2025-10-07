
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import type { Movie } from '@/types';
import { useWatchHistory } from '@/hooks/useWatchHistory';

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
  <svg viewBox="0 0 36 36" fill="currentColor" {...props}><path d="M4.5 12.5h4a.5.5 0 0 0 .5-.5V8.5a.5.5 0 0 0-.5-.5H4a.5.5 0 0 0-.5.5v4.5a.5.5 0 0 0 .5.5Zm1-4h3v3h-3v-3Zm26 0h3v3h-3v-3ZM28 8h.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-4.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h4ZM4.5 28.5h4a.5.5 0 0 0 .5-.5v-3.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v3.5a.5.5 0 0 0 .5.5Zm1-4h3v3h-3v-3Zm25-1v3h-3v-3h3Zm-4-1h4.5a.5.5 0 0 0 .5-.5v-3.5a.5.5 0 0 0-.5-.5h-4.5a.5.5 0 0 0-.5.5v3.5a.5.5 0 0 0 .5.5Z"></path></svg>
);
const EpisodesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M21 16H3v-2h18v2zm0-4H3v-2h18v2zm0-4H3V6h18v2z"></path></svg>
);
const NextEpisodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M15.5 15.38V8.62L21 12l-5.5 3.38zM14 12l-5.5-3.38v6.76L14 12zM3 6h2v12H3V6z"></path></svg>
);
const CaptionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM6 12h2v2H6v-2zm8 6H6v-2h8v2zm0-4H6v-2h8v2z"></path></svg>
);
const Rewind10Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.5,3C7.26,3,3,7.26,3,12.5S7.26,22,12.5,22S22,17.74,22,12.5C22,12.2,22,11.9,21.96,11.61L19.92,13.65C19.97,14.1,20,14.55,20,15c0,4.14-3.36,7.5-7.5,7.5S5,19.14,5,15c0-3.35,2.2-6.18,5.18-7.11L9,9.24V7.11C8.3,7.26,7.66,7.5,7.07,7.81L6.04,6.78C7.38,5.7,8.94,5,10.68,4.56L11,2.5C11.5,2.53,12,2.54,12.5,2.54M10,14H8V12h2.5L10,12.5V10.5h-2V9h4v6h-2V14M16.5,14H13V9h4.5v1.5H14.5v2h1.5V14z" />
    </svg>
);

const Forward10Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.5,3C17.74,3,22,7.26,22,12.5S17.74,22,12.5,22S3,17.74,3,12.5c0-0.34,0.03-0.67,0.07-1l2.1,2.1C5.07,13.75,5,14.12,5,14.5c0,4.14,3.36,7.5,7.5,7.5s7.5-3.36,7.5-7.5c0-3.35-2.2-6.18-5.18-7.11L14,9.24V7.11c0.7,0.15,1.34,0.39,1.93,0.71l1.03-1.03C15.62,5.7,14.06,5,12.32,4.56L12,2.5C12.17,2.5,12.33,2.5,12.5,2.5M11,14h2V9h-4.5v1.5H11v2H9V14h2m5.5,0h2V9h-4.5v1.5H16.5v2H15V14h1.5Z" />
    </svg>
);


interface VideoPlayerProps {
  src: string;
  media: Movie;
}

export default function VideoPlayer({ src, media }: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const infoTimeoutRef = useRef<number | null>(null);

  const { history, updateWatchHistory } = useWatchHistory();
  const watchHistoryItem = history.find(item => item.id === media.id);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isEpisodesPanelOpen, setIsEpisodesPanelOpen] = useState(false);
  
  const isTvShow = media.media_type === 'tv';
  const title = media.title || media.name;
  const description = media.overview;

  // Jump to saved time on initial load
  useEffect(() => {
    if (videoRef.current && watchHistoryItem) {
      videoRef.current.currentTime = watchHistoryItem.progress;
    }
  }, [watchHistoryItem]);
  
  // Save progress to watch history
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.duration > 0) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        // Only save if watched for at least 60s and not finished
        if (currentTime > 60 && currentTime / duration < 0.98) {
          updateWatchHistory(media.id, currentTime, duration, media.media_type);
        }
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [media.id, media.media_type, updateWatchHistory]);


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
        setIsEpisodesPanelOpen(false);
      }, 4000);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration || 0);
    
    const handlePlay = () => { 
        setIsPlaying(true); 
        resetControlsTimeout();
        if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        setShowInfo(false);
    };

    const handlePause = () => { 
        setIsPlaying(false); 
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setShowControls(true); 
        if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        infoTimeoutRef.current = window.setTimeout(() => setShowInfo(true), 2000);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseMove);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseMove);
    };
  }, [resetControlsTimeout, handleMouseMove]);
  
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play(); else video.pause();
  }, []);

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleSeekRelative = useCallback((offset: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + offset));
    }
  }, [duration]);

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = playerRef.current;
    if (!player) return;
    if (!document.fullscreenElement) {
        player.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        resetControlsTimeout();
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.key === 'ArrowLeft') handleSeekRelative(-10);
        else if (e.key === 'ArrowRight') handleSeekRelative(10);
        else if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); }
        else if (e.key.toLowerCase() === 'm') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, handleSeekRelative, toggleFullscreen, resetControlsTimeout]);

  return (
    <div ref={playerRef} className={cn("w-full h-screen bg-black flex justify-center items-center relative select-none overflow-hidden", showControls ? "cursor-auto" : "cursor-none")} onDoubleClick={toggleFullscreen}>
      <video ref={videoRef} src={src} className="w-full h-full object-contain" autoPlay onClick={togglePlay}/>
      
      {/* Dimmer & Info Overlay */}
      <div className={cn('absolute inset-0 bg-black/40 transition-opacity duration-500 z-10', (showControls || !isPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none')} />

        {/* Info Overlay on Left */}
        <div className={cn("absolute left-5 md:left-8 bottom-28 md:bottom-32 text-white max-w-md transition-opacity duration-500 z-20", showInfo && !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none")}>
            {isTvShow && <p className="text-lg">Hometown Cha-Cha-Cha</p> }
             <div className="flex items-center gap-2 text-sm text-white/80">
                {isTvShow && <><span>Season 1</span><span className="text-xs">•</span></>}
                <span>{media.release_date?.substring(0,4) || media.first_air_date?.substring(0,4)}</span>
                {isTvShow && <span className="text-xs">•</span>}
                {isTvShow && <span>Drama</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold my-2">{title}</h1>
            <p className="text-base text-white/90 line-clamp-3">{description}</p>
        </div>
        
      {/* Main Controls Overlay */}
      <div className={cn('absolute inset-0 transition-opacity duration-500 z-20', (showControls || !isPlaying) ? 'opacity-100' : 'opacity-0 pointer-events-none')} >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-5 md:p-8 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={(e) => { e.stopPropagation(); router.back(); }} className="text-white h-12 w-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-8 w-8" />
          </button>
          <div className="flex items-center gap-4">
             {isTvShow && (
                 <>
                    <button className="bg-black/50 border border-white/50 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-black/80">
                        Season 1 <svg width="1em" height="1em" viewBox="0 0 24 24" className="ml-2 h-4 w-4"><path fill="currentColor" d="m7 10l5 5l5-5z"></path></svg>
                    </button>
                    <button onClick={() => setIsEpisodesPanelOpen(false)} className={cn("text-white h-12 w-12 flex items-center justify-center hover:bg-white/20", isEpisodesPanelOpen ? "visible" : "invisible")}>
                        <X className="h-8 w-8" />
                    </button>
                 </>
             )}
          </div>
        </div>
        
        {/* Center Controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-12" onClick={togglePlay}>
            <button onClick={(e) => handleSeekRelative(-10, e)} className="text-white/80 hover:text-white transition-transform hover:scale-110 flex items-center justify-center w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm">
                <Rewind10Icon className="w-8 h-8" />
            </button>
            <button className="h-20 w-20 rounded-full flex items-center justify-center transition-transform hover:scale-110 bg-black/30 backdrop-blur-sm ring-2 ring-white/50">
                {isPlaying ? <PauseIcon className="h-10 w-10 text-white" /> : <PlayIcon className="h-10 w-10 text-white" />}
            </button>
            <button onClick={(e) => handleSeekRelative(10, e)} className="text-white/80 hover:text-white transition-transform hover:scale-110 flex items-center justify-center w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm">
                <Forward10Icon className="w-8 h-8" />
            </button>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-white bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center gap-4 w-full">
                <span className="text-sm font-medium w-16 text-center">{formatTime(progress)}</span>
                <Slider 
                    value={[progress]} 
                    max={duration} 
                    step={1} 
                    onValueChange={handleSeek} 
                    className="w-full cursor-pointer h-1.5 group/slider"
                />
                 <span className="text-sm font-medium w-16 text-center">{formatTime(duration)}</span>
            </div>

          <div className="flex justify-between items-center mt-4">
             <div className="flex items-center gap-4">
                 <button onClick={(e) => toggleMute(e)} className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded-full">
                    {isMuted ? <VolumeMutedIcon className="h-6 w-6" /> : <VolumeHighIcon className="h-6 w-6" />}
                 </button>
             </div>
            <div className="flex items-center gap-2">
                {isTvShow && <button className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded-full"><NextEpisodeIcon className="h-6 w-6" /></button>}
                {isTvShow && <button onClick={() => setIsEpisodesPanelOpen(p => !p)} className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded-full"><EpisodesIcon className="h-6 w-6" /></button>}
                <button className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded-full"><CaptionsIcon className="h-6 w-6" /></button>
                <button onClick={(e) => toggleFullscreen(e)} className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded-full">{isFullscreen ? <FullscreenExitIcon className="h-6 w-6" /> : <FullscreenEnterIcon className="h-6 w-6" />}</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Episodes Panel */}
      {isTvShow && (
       <div className={cn(
        'absolute top-0 right-0 h-full w-[420px] bg-black/80 backdrop-blur-md transition-transform duration-500 ease-in-out z-30 p-8 pt-24 overflow-y-auto',
        isEpisodesPanelOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <h2 className="text-2xl font-bold text-white mb-6">Episodes</h2>
        <div className="space-y-4">
            {[...Array(16)].map((_, i) => (
                <div key={i} className={cn("flex gap-4 p-2 rounded-md cursor-pointer", i === 10 ? "bg-white/20" : "hover:bg-white/10")}>
                    <span className="text-xl text-white/80 w-8 text-center pt-1">{i+1}</span>
                    <div className="relative w-40 h-24 rounded-md overflow-hidden">
                        <Image src={`https://picsum.photos/seed/ep${i+1}/160/90`} alt={`Episode ${i+1}`} fill objectFit="cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <PlayIcon className="h-8 w-8 text-white/80" />
                        </div>
                    </div>
                    <div className="flex-1 text-white">
                        <h3 className="font-bold">Episode {i+1}</h3>
                        <p className="text-sm text-white/70">{i % 2 === 0 ? "45m" : "52m"}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
       )}
    </div>
  );
}

    