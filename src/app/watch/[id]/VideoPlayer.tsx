"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaRedoAlt,
  FaUndoAlt,
  FaTachometerAlt,
  FaLayerGroup,
} from "react-icons/fa";
import { MdSubtitles, MdAudiotrack } from "react-icons/md";

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  poster?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  autoPlay = true,
  controls = true,
  poster,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Unicode-safe base64 (browser)
  function base64EncodeUnicode(str: string) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return btoa(str);
    }
  }

  // Force all streams through /api/proxy (Base64 encoded + URI-encoded)
  function encodeProxyUrl(url: string): string {
    if (!url) return url;
    if (
      url.startsWith("/api/proxy") ||
      url.includes("/api/proxy?url=") ||
      url.startsWith("blob:") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    try {
      const encoded = base64EncodeUnicode(url);
      return `/api/proxy?url=${encodeURIComponent(encoded)}`;
    } catch {
      const encoded = btoa(url);
      return `/api/proxy?url=${encodeURIComponent(encoded)}`;
    }
  }

  // --- UI + playback state ---
  const [playing, setPlaying] = useState<boolean>(!!autoPlay);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bufferEnd, setBufferEnd] = useState<number>(0);
  const [showTracks, setShowTracks] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);

  // extra UI states from the Netflix UI (these are purely UI and don't change playback logic except where necessary)
  const [progress, setProgress] = useState<number>(0); // 0 - 100
  const [showControls, setShowControls] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState<boolean>(false);
  const [showAudioMenu, setShowAudioMenu] = useState<boolean>(false);
  const [showEpisodesMenu, setShowEpisodesMenu] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const isValidNumber = (n: any) => typeof n === "number" && isFinite(n) && !isNaN(n);

  // helper to format time mm:ss / hh:mm:ss if long
  function fmt(time: number) {
    if (!isFinite(time) || time <= 0) return "0:00";
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  // --- Fullscreen helpers ---
  const containerRef = useRef<HTMLDivElement | null>(null);

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // --- Playback wiring (unchanged HLS logic, preserved) ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    const proxiedSrc = encodeProxyUrl(src);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = proxiedSrc;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);

      const onError = (_event: any, data: any) => {
        console.warn("HLS error:", data);
        if (!hls) return;
        if (data && data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              try {
                hls.startLoad();
              } catch {}
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              try {
                hls.recoverMediaError();
              } catch {}
              break;
            default:
              try {
                hls.destroy();
              } catch {}
              hls = null;
              break;
          }
        }
      };

      hls.on(Hls.Events.ERROR, onError);
    } else {
      video.src = proxiedSrc;
    }

    // Keep the original behaviour: set muted from state
    video.muted = muted;

    const onLoadedMeta = () => {
      setDuration(video.duration || 0);
      setCurrentTime(video.currentTime || 0);
      setPlaying(!video.paused && !video.ended);
      // sync our UI progress/volume
      if (isValidNumber(video.duration) && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      try {
        if (isValidNumber(video.volume)) setVolume(video.volume);
      } catch {}
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
      try {
        const buf = video.buffered;
        if (buf && buf.length) {
          setBufferEnd(buf.end(buf.length - 1));
        }
      } catch {}
      // update UI progress if not dragging
      if (!isDragging && isValidNumber(video.duration) && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => {
      setMuted(video.muted);
      try {
        if (isValidNumber(video.volume)) setVolume(video.volume);
      } catch {}
    };

    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);

    if (autoPlay) {
      video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      if (hls) {
        try {
          hls.destroy();
        } catch {}
        hls = null;
      }
    };
  }, [src, autoPlay]);

  // --- control actions (preserve original logic) ---
  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }

  function seekToRatio(ratio: number) {
    const v = videoRef.current;
    if (!v || !isFinite(duration) || duration <= 0) return;
    v.currentTime = Math.max(0, Math.min(duration, ratio * duration));
    setCurrentTime(v.currentTime);
  }

  function rewind10() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime - 10);
    setCurrentTime(v.currentTime);
  }

  function forward10() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(duration || Infinity, v.currentTime + 10);
    setCurrentTime(v.currentTime);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  // volume UI helper (keeps behavior but does not change core playback wiring logic)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const v = videoRef.current;
    if (v && isFinite(newVolume)) {
      v.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        v.muted = true;
        setMuted(true);
      } else {
        v.muted = false;
        setMuted(false);
      }
    }
  };

  const audioOptions = ["Original", "English (5.1)", "Spanish"];
  const subtitleOptions = ["Off", "English", "Spanish"];

  // derive a display title from the src (fallback, not required)
  function getDisplayTitle() {
    try {
      if (!src) return "";
      const url = new URL(src, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      const name = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
      // strip file extension or long hashes:
      return name.replace(/\.(m3u8|mp4|ts)$/i, "").replace(/[_-]/g, " ");
    } catch {
      return "";
    }
  }

  const displayTitle = getDisplayTitle();

  // --- UI helpers ---
  const selectSpeed = (rate: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  // --- render ---
  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center ${className}`}
      style={{ height: "100vh", width: "100vw" }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video element fills background */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-black"
        controls={false}
        autoPlay={autoPlay}
        playsInline
        poster={poster}
      />

      {/* Top-left: Back to Browse (small) */}
      <div className="absolute top-4 left-4 z-40 pointer-events-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white/90 bg-black/40 px-3 py-1 rounded hover:bg-black/60 transition"
          aria-label="Back to browse"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Centered subtitles (big, white, subtle shadow) */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-30">
        <div className="mb-28 max-w-[85%] text-center">
          <div
            className="inline-block px-2 py-1"
            style={{
              color: "white",
              fontSize: "20px",
              fontFamily: 'Arial, Helvetica, sans-serif',
              textShadow: "0 2px 0 rgba(0,0,0,0.95), 0 4px 12px rgba(0,0,0,0.6)",
            }}
          >
            [chuckles] I mean, we couldn't believe what we were hearing.
          </div>
        </div>
      </div>

      {/* Bottom controls container (Netflix-style UI, logic preserved) */}
      <div className="absolute left-0 right-0 bottom-0 z-40 pointer-events-none">
        {/* Slim progress bar area (clickable) */}
        <div
          className="w-full px-4 pb-3 pointer-events-auto"
          onClick={(e) => {
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            const clickX = (e as any).clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            seekToRatio(ratio);
          }}
        >
          <div className="relative h-1 w-full bg-black/40 rounded">
            {/* buffer */}
            <div
              className="absolute left-0 top-0 bottom-0 rounded"
              style={{
                width: duration ? `${(Math.min(bufferEnd, duration) / duration) * 100}%` : "0%",
                backgroundColor: "rgba(255,255,255,0.25)",
                height: "100%",
              }}
            />
            {/* played (red) */}
            <div
              className="absolute left-0 top-0 bottom-0 rounded"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                backgroundColor: "#e50914",
                height: "100%",
              }}
            />
          </div>
        </div>

        {/* Main control strip (translucent black bar) */}
        <div className="w-full bg-gradient-to-t from-black/80 to-black/30 px-6 py-3 flex items-center justify-between pointer-events-auto">
          {/* Left group: small icons + title */}
          <div className="flex items-center gap-4">
            {/* Left-side: small controls cluster */}
            <div className="flex items-center gap-6">
              <button
                onClick={rewind10}
                aria-label="Rewind 10s"
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/50 transition transform hover:scale-105"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="none" fill="transparent" />
                  <path d="M14.5 7.5a6.5 6.5 0 1 0 0 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(180 12 12)"/>
                  <path d="M10.5 9.5L7 12l3.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(180 12 12)"/>
                  <text x="8.5" y="16" fill="white" fontSize="9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">10</text>
                </svg>
              </button>

              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/70 transition transform hover:scale-105"
              >
                {playing ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="7" y="6" width="3" height="12" rx="0.8" fill="white" />
                    <rect x="14" y="6" width="3" height="12" rx="0.8" fill="white" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 5v14l11-7L7 5z" fill="white" />
                  </svg>
                )}
              </button>

              <button
                onClick={forward10}
                aria-label="Forward 10s"
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/50 transition transform hover:scale-105"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="none" fill="transparent" />
                  <path d="M9.5 7.5a6.5 6.5 0 1 1 0 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M13.5 9.5L17 12l-3.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <text x="13.5" y="16" fill="white" fontSize="9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">10</text>
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/50 transition transform hover:scale-105"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 9v6h4l5 5V4l-5 5H5z" fill="white" />
                    {muted && <path d="M6 6l12 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />}
                  </svg>
                </button>

                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 p-3 rounded-lg"
                    >
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-36 w-1 accent-red-600 rotate-[-90deg] cursor-pointer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Title / episode text (small) */}
            <div className="text-sm text-white/90 leading-tight select-none max-w-[36vw] truncate">
              <div className="font-semibold">{displayTitle || "Unknown Title"}</div>
              <div className="text-xs text-white/70">S1:E1 • Everything is Fine</div>
            </div>

            {/* current time / total */}
            <div className="text-xs text-white/80 select-none">{fmt(currentTime)}</div>
          </div>

          {/* Right group: time, audio/subtitles, fullscreen */}
          <div className="flex items-center gap-3">
            {/* audio/subtitles (merged menu) */}
            <div className="relative">
              <button
                onClick={() => setShowTracks((s) => !s)}
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition transform hover:scale-105"
                aria-label="Audio / Subtitles"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="1" stroke="white" strokeWidth="1.4" fill="transparent" />
                  <text x="7.5" y="15" fill="white" fontSize="9" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">CC</text>
                </svg>
              </button>

              {showTracks && (
                <div className="absolute right-0 bottom-16 w-44 bg-black/95 rounded p-3 text-white z-50 shadow-lg">
                  <div className="text-xs font-semibold mb-2">Subtitles</div>
                  <div className="flex flex-col gap-1 mb-2">
                    {subtitleOptions.map((s) => (
                      <button
                        key={s}
                        className="text-left text-sm px-2 py-1 rounded hover:bg-white/5"
                        onClick={() => setShowTracks(false)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-semibold mb-2">Audio</div>
                  <div className="flex flex-col gap-1">
                    {audioOptions.map((a) => (
                      <button
                        key={a}
                        className="text-left text-sm px-2 py-1 rounded hover:bg-white/5"
                        onClick={() => setShowTracks(false)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* speed */}
            <div className="relative">
              <button
                aria-label="Speed"
                onClick={() => setShowSpeedMenu((s) => !s)}
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition transform hover:scale-105"
              >
                <FaTachometerAlt className="text-white text-xl" />
              </button>

              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-16 right-0 bg-black/95 p-3 rounded-lg text-white space-y-2"
                  >
                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => selectSpeed(rate)}
                        className={`block text-base px-3 py-1 w-full text-left rounded ${
                          playbackRate === rate ? "text-red-500" : "text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* subtitles (separate menu if desired) */}
            <div className="relative">
              <button
                onClick={() => setShowSubtitlesMenu((s) => !s)}
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition transform hover:scale-105"
              >
                <MdSubtitles className="text-white text-xl" />
              </button>

              <AnimatePresence>
                {showSubtitlesMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-16 right-0 bg-black/95 p-3 rounded-lg text-white space-y-2"
                  >
                    {subtitleOptions.map((lang) => (
                      <button key={lang} className="block text-base px-3 py-1 w-full text-left hover:text-red-500">
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* audio */}
            <div className="relative">
              <button
                onClick={() => setShowAudioMenu((s) => !s)}
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition transform hover:scale-105"
              >
                <MdAudiotrack className="text-white text-xl" />
              </button>

              <AnimatePresence>
                {showAudioMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-16 right-0 bg-black/95 p-3 rounded-lg text-white space-y-2"
                  >
                    {audioOptions.map((audio) => (
                      <button key={audio} className="block text-base px-3 py-1 w-full text-left hover:text-red-500">
                        {audio}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* episodes */}
            <div className="relative">
              <button
                onClick={() => setShowEpisodesMenu((s) => !s)}
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition transform hover:scale-105"
              >
                <FaLayerGroup className="text-white text-xl rotate-180" />
              </button>

              <AnimatePresence>
                {showEpisodesMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-16 right-0 bg-black/95 p-3 rounded-lg text-white space-y-2 w-48"
                  >
                    {["Episode 1", "Episode 2", "Episode 3"].map((ep) => (
                      <button key={ep} className="block text-base px-3 py-1 w-full text-left hover:text-red-500">
                        {ep}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* fullscreen */}
            <button
              aria-label="Toggle fullscreen"
              onClick={toggleFullscreen}
              className="w-12 h-12 rounded bg-black/40 flex items-center justify-center hover:bg-black/60 transition transform hover:scale-105"
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 9H5V5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 15h4v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9V3h6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 15v6h-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;