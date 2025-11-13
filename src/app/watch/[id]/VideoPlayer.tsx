// src/app/watch/[id]/VideoPlayer.tsx
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
  FaForward,
  FaBackward,
  FaClosedCaptioning,
} from "react-icons/fa";
import { MdAudiotrack } from "react-icons/md";

export type Caption = { label: string; language?: string; url: string };

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  poster?: string;
  className?: string;
  captions?: Caption[];
}

const ACCENT = "#e50914";

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  autoPlay = true,
  controls = true,
  poster,
  className = "",
  captions = [],
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // keep references to created <track> elements so we can robustly toggle modes
  const createdTracksRef = useRef<HTMLTrackElement[]>([]);

  // --- UI + playback state ---
  const [playing, setPlaying] = useState<boolean>(!!autoPlay);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bufferEnd, setBufferEnd] = useState<number>(0);
  const [showTracks, setShowTracks] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);

  const [progress, setProgress] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // caption selection
  const [activeCaptionIndex, setActiveCaptionIndex] = useState<number | null>(null);

  const volumeSliderRef = useRef<HTMLDivElement | null>(null);
  const volumePointerState = useRef<{ dragging: boolean }>({ dragging: false });

  const isValidNumber = (n: any) => typeof n === "number" && isFinite(n) && !isNaN(n);

  function fmt(time: number) {
    if (!isFinite(time) || time <= 0) return "0:00";
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  // --- Fullscreen helpers ---
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

  // Unicode-safe base64 (browser)
  function base64EncodeUnicode(str: string) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return btoa(str);
    }
  }

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

  // --- Add caption <track> elements and selection (robust) ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // remove previously generated tracks
    const existing = Array.from(video.querySelectorAll('track[data-generated="true"]')) as HTMLTrackElement[];
    existing.forEach((t) => t.remove());
    createdTracksRef.current = [];

    // add each caption as a track element and keep the reference
    captions.forEach((c, idx) => {
      try {
        const tr = document.createElement("track");
        tr.kind = "subtitles";
        tr.label = c.label || c.language || `Caption ${idx + 1}`;
        tr.srclang = c.language || "und";
        tr.src = encodeProxyUrl(c.url);
        tr.setAttribute("data-generated", "true");
        tr.default = false;
        video.appendChild(tr);
        createdTracksRef.current.push(tr);
      } catch (err) {
        // ignore individual failures
      }
    });

    // after a short delay (and again after loadedmetadata) ensure modes follow activeCaptionIndex
    const ensure = () => {
      const v = videoRef.current;
      if (!v) return;
      createdTracksRef.current.forEach((tr, i) => {
        try {
          // tr.track might not be immediately available; guard
          const tt = (tr as any).track as TextTrack | undefined | null;
          if (tt) {
            tt.mode = (activeCaptionIndex !== null && i === activeCaptionIndex) ? "showing" : "disabled";
          }
        } catch {}
      });
    };

    const t = setTimeout(ensure, 400);

    return () => {
      clearTimeout(t);
    };
  }, [captions, activeCaptionIndex]);

  // --- Playback wiring & HLS error handling ---
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
        backBufferLength: 60,
        maxMaxBufferLength: 180,
      });

      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);

      let lastNonFatalLogAt = 0;

      const onError = (_event: any, data: any) => {
        if (!hls) return;
        if (data && data.fatal) {
          console.error("HLS fatal error:", data);
          try { hls.destroy(); } catch {}
          hls = null;
          return;
        }
        try {
          if (data && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            try { hls.startLoad(); } catch {}
          } else if (data && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try { hls.recoverMediaError(); } catch {}
          }
        } catch {}
        const now = Date.now();
        if (now - lastNonFatalLogAt > 5000) {
          console.debug("HLS non-fatal (recovery attempted):", data);
          lastNonFatalLogAt = now;
        }
      };

      hls.on(Hls.Events.ERROR, onError);
    } else {
      video.src = proxiedSrc;
    }

    // keep muted per state
    video.muted = muted;

    const onLoadedMeta = () => {
      setDuration(video.duration || 0);
      setCurrentTime(video.currentTime || 0);
      setPlaying(!video.paused && !video.ended);
      if (isValidNumber(video.duration) && video.duration > 0) setProgress((video.currentTime / video.duration) * 100);
      try { if (isValidNumber(video.volume)) setVolume(video.volume); } catch {}

      // ensure caption track modes are applied after metadata is available
      createdTracksRef.current.forEach((tr, i) => {
        try {
          const tt = (tr as any).track as TextTrack | undefined | null;
          if (tt) tt.mode = (activeCaptionIndex !== null && i === activeCaptionIndex) ? "showing" : "disabled";
        } catch {}
      });
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
      try {
        const buf = video.buffered;
        if (buf && buf.length) setBufferEnd(buf.end(buf.length - 1));
      } catch {}
      if (!isDragging && isValidNumber(video.duration) && video.duration > 0) setProgress((video.currentTime / video.duration) * 100);
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => {
      setMuted(video.muted);
      try { if (isValidNumber(video.volume)) setVolume(video.volume); } catch {}
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
        try { hls.destroy(); } catch {}
        hls = null;
      }
    };
  }, [src, autoPlay, muted, isDragging]);

  // --- controls ---
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

  // keep a simple input handler too (for keyboard accessibility). We'll also support pointer drag on the custom slider below.
  const handleVolumeChange = (newVolume: number) => {
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

  // pointer-based dragging helpers
  const handlePointerMove = (ev: PointerEvent) => {
    if (!volumePointerState.current.dragging) return;
    const el = volumeSliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientY = ev.clientY;
    const percent = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
    handleVolumeChange(percent);
  };

  const handlePointerUp = (ev?: PointerEvent) => {
    if (!volumePointerState.current.dragging) return;
    volumePointerState.current.dragging = false;
    setIsDragging(false);
    try {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    } catch {}
  };

  const onVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch {}
    volumePointerState.current.dragging = true;
    setIsDragging(true);

    // add global listeners for move/up so dragging continues outside the element
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // immediately update once
    const rect = el.getBoundingClientRect();
    const clientY = e.clientY;
    const percent = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
    handleVolumeChange(percent);
  };

  const audioOptions = ["Original", "English (5.1)", "Spanish"];
  const speedOptions = [0.5, 1, 1.25, 1.5, 2];

  function selectSpeed(rate: number) {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }

  // toggle caption using createdTracksRef (more reliable than relying on textTracks indices)
  function toggleCaption(index: number | null) {
    setActiveCaptionIndex((prev) => (prev === index ? null : index));

    // apply immediately where possible
    createdTracksRef.current.forEach((tr, i) => {
      try {
        const tt = (tr as any).track as TextTrack | undefined | null;
        if (tt) tt.mode = (index !== null && i === index) ? "showing" : "disabled";
      } catch {}
    });

    // some browsers expose textTracks after a delay — also schedule a fallback pass
    setTimeout(() => {
      createdTracksRef.current.forEach((tr, i) => {
        try {
          const tt = (tr as any).track as TextTrack | undefined | null;
          if (tt) tt.mode = (index !== null && i === index) ? "showing" : "disabled";
        } catch {}
      });
    }, 500);

    setShowTracks(false);
  }

  // display title derived from src
  function getDisplayTitle() {
    try {
      if (!src) return "";
      const url = new URL(src, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      const name = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
      return name.replace(/\.(m3u8|mp4|ts)$/i, "").replace(/[_-]/g, " ");
    } catch {
      return "";
    }
  }

  const displayTitle = getDisplayTitle();

  // --- render ---
  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center ${className}`}
      style={{ height: "100vh", width: "100vw" }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-black"
        controls={false}
        autoPlay={autoPlay}
        playsInline
        poster={poster}
      />

      {/* Top-left back */}
      <div className="absolute top-4 left-4 z-40 pointer-events-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white/95 bg-black/40 px-3 py-1 rounded hover:bg-black/60 transition"
          aria-label="Back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Centered subtitles placeholder (the real captions come from tracks) */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-30">
        <div className="mb-28 max-w-[85%] text-center">
          {/* If you want to render VTT cues manually, you can read video.textTracks here */}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute left-0 right-0 bottom-0 z-40 pointer-events-none">
        {/* Progress bar */}
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
            <div
              className="absolute left-0 top-0 bottom-0 rounded"
              style={{
                width: duration ? `${(Math.min(bufferEnd, duration) / duration) * 100}%` : "0%",
                backgroundColor: "rgba(255,255,255,0.25)",
                height: "100%",
              }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 rounded"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                backgroundColor: ACCENT,
                height: "100%",
              }}
            />
          </div>
        </div>

        {/* Control strip */}
        <div className="w-full bg-gradient-to-t from-black/85 to-black/30 px-6 py-3 flex items-center justify-between pointer-events-auto">
          {/* Left cluster */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={rewind10}
                aria-label="Rewind 10s"
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/55 transition transform hover:scale-105"
              >
                <FaBackward className="text-white" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:shadow-lg transition transform hover:scale-105"
                style={{ color: ACCENT }}
              >
                {playing ? <FaPause /> : <FaPlay />}
              </button>

              <button
                onClick={forward10}
                aria-label="Forward 10s"
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/55 transition transform hover:scale-105"
              >
                <FaForward className="text-white" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowVolumeSlider((s) => !s)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/55 transition transform hover:scale-105"
                >
                  {muted ? <FaVolumeMute className="text-white" /> : <FaVolumeUp className="text-white" />}
                </button>

                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/90 p-3 rounded-lg"
                    >
                      {/* Custom vertical slider with pointer events for reliable dragging */}
                      <div
                        ref={volumeSliderRef}
                        onPointerDown={onVolumePointerDown}
                        role="slider"
                        aria-valuemin={0}
                        aria-valuemax={1}
                        aria-valuenow={volume}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowRight") handleVolumeChange(Math.min(1, volume + 0.05));
                          if (e.key === "ArrowDown" || e.key === "ArrowLeft") handleVolumeChange(Math.max(0, volume - 0.05));
                          if (e.key === "Home") handleVolumeChange(0);
                          if (e.key === "End") handleVolumeChange(1);
                        }}
                        style={{
                          height: 160,
                          width: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          touchAction: "none",
                          userSelect: "none",
                        }}
                      >
                        <div className="relative h-full w-3 bg-white/8 rounded-lg flex items-end">
                          <div
                            className="absolute left-0 right-0 bottom-0 rounded"
                            style={{ height: `${volume * 100}%`, backgroundColor: ACCENT }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              transform: "translate(-50%, 0)",
                              bottom: `${volume * 100}%`,
                              marginBottom: -8,
                              width: 18,
                              height: 18,
                              borderRadius: 18,
                              background: "white",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-sm text-white/95 leading-tight select-none max-w-[36vw] truncate">
              <div className="font-semibold">{displayTitle || "Unknown Title"}</div>
              <div className="text-xs text-white/70">{fmt(currentTime)} / {fmt(duration)}</div>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* captions menu (shows list of captions) */}
            <div className="relative">
              <button
                onClick={() => setShowTracks((s) => !s)}
                className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/55 transition transform hover:scale-105"
                aria-label="Audio / Subtitles"
              >
                <FaClosedCaptioning className="text-white" />
              </button>

              {showTracks && (
                <div className="absolute right-0 bottom-16 w-48 bg-black/95 rounded p-3 text-white z-50 shadow-lg">
                  <div className="text-xs font-semibold mb-2">Subtitles</div>
                  <div className="flex flex-col gap-1 mb-2">
                    <button
                      onClick={() => { toggleCaption(null); }}
                      className={`text-left text-sm px-2 py-1 rounded ${activeCaptionIndex === null ? "text-red-500" : "hover:bg-white/5"}`}
                    >
                      Off
                    </button>
                    {captions.map((c, i) => (
                      <button
                        key={c.label + i}
                        onClick={() => { toggleCaption(i); }}
                        className={`text-left text-sm px-2 py-1 rounded ${activeCaptionIndex === i ? "text-red-500" : "hover:bg-white/5"}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-semibold mb-2">Speed</div>
                  <div className="flex flex-col gap-1">
                    {speedOptions.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => selectSpeed(rate)}
                        className={`block text-base px-3 py-1 w-full text-left rounded ${playbackRate === rate ? "text-red-500" : "text-white"}`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* audio icon */}
            <button
              className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/55 transition transform hover:scale-105"
              aria-label="Audio"
              onClick={() => setShowSpeedMenu((s) => !s)}
            >
              <MdAudiotrack className="text-white text-xl" />
            </button>

            {/* fullscreen toggle */}
            <button
              aria-label="Toggle fullscreen"
              onClick={toggleFullscreen}
              className="w-12 h-12 rounded bg-black/40 flex items-center justify-center hover:bg-black/55 transition transform hover:scale-105"
            >
              <FaExpand className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
