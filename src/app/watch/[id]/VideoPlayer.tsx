"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export type SourceItem = {
  label: string; // e.g. "1080p"
  src: string;
  type?: string; // optional mime-type
};

export type CaptionItem = {
  src: string;
  srclang?: string;
  label?: string;
  default?: boolean;
};

export interface VideoPlayerProps {
  src?: string | null; // single playable URL (hls or mp4)
  sources?: SourceItem[]; // optional quality list
  captions?: CaptionItem[]; // optional captions (vtt)
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export default function VideoPlayer({
  src = null,
  sources,
  captions,
  poster,
  autoPlay = false,
  controls = true,
  className = "w-full h-full",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src ?? (sources && sources[0]?.src) ?? null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(1);

  // update when src prop changes
  useEffect(() => {
    setCurrentSrc(src ?? (sources && sources[0]?.src) ?? null);
  }, [src, sources]);

  // attach HLS or native source
  useEffect(() => {
    setError(null);
    setLoading(true);

    // ensure we always read the latest element when using it inside async handlers
    const videoEl = videoRef.current;
    if (!videoEl) {
      setLoading(false);
      return;
    }

    // cleanup existing Hls instance
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) {
        /* ignore */
      }
      hlsRef.current = null;
    }

    const v = videoEl as HTMLMediaElement;

    async function attach(srcToAttach: string) {
      if (!srcToAttach) {
        setLoading(false);
        return;
      }

      // detect hls by file extension or by typical query
      const isM3u8 = /\.m3u8(\?|$)/i.test(srcToAttach) || /playlist/i.test(srcToAttach);

      try {
        if (isM3u8) {
          // prefer hls.js when supported
          if (typeof window !== "undefined" && Hls.isSupported()) {
            const hls = new Hls({
              debug: true, // enable debug logs
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
            });
            hlsRef.current = hls;

            // attach media using a non-null HTMLMediaElement
            hls.attachMedia(v as HTMLMediaElement);

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              try {
                console.log("[hls] MEDIA_ATTACHED — loading source:", srcToAttach);
                hls.loadSource(srcToAttach);
              } catch (err) {
                setError(String(err ?? "Failed to load HLS source"));
                setLoading(false);
              }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
              // full diagnostic in console
              console.error("[hls] ERROR event:", data);
              const fatal = (data && (data as any).fatal) ?? false;
              const details = (data && (data as any).details) ?? JSON.stringify(data);
              // Show fatal details to user
              if (fatal) {
                setError(`HLS error: ${details}`);
              }
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("[hls] MANIFEST_PARSED");
              setLoading(false);
              if (autoPlay) {
                v.play().catch(() => {});
              }
            });

            // additional helpful event logging while debugging
            hls.on(Hls.Events.LEVEL_LOADED, (ev, data) => {
              console.log("[hls] LEVEL_LOADED", data);
            });

            return;
          }

          // Safari native HLS fallback
          if (v.canPlayType && v.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[video] using native HLS (Safari) for", srcToAttach);
            (v as HTMLVideoElement).src = srcToAttach;
            v.addEventListener("loadedmetadata", () => setLoading(false), { once: true });
            if (autoPlay) (v as HTMLVideoElement).play().catch(() => {});
            return;
          }

          // last resort: assign src and hope for the best
          (v as HTMLVideoElement).src = srcToAttach;
          v.addEventListener("loadedmetadata", () => setLoading(false), { once: true });
          return;
        }

        // non-HLS (mp4, webm, etc.)
        (v as HTMLVideoElement).src = srcToAttach;
        v.addEventListener("loadedmetadata", () => setLoading(false), { once: true });
        if (autoPlay) (v as HTMLVideoElement).play().catch(() => {});
      } catch (err: any) {
        setError(String(err?.message ?? err));
        setLoading(false);
      }
    }

    attach(currentSrc ?? "");

    return () => {
      // cleanup
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {}
        hlsRef.current = null;
      }

      const cleanupEl = videoRef.current;
      if (cleanupEl) {
        try {
          cleanupEl.pause();
        } catch (e) {}
        try {
          cleanupEl.removeAttribute("src");
          // remove only <track> children we added
          const tracks = Array.from(cleanupEl.getElementsByTagName("track"));
          tracks.forEach((t) => t.remove());
        } catch (e) {}
      }
    };
  }, [currentSrc, autoPlay]);

  // playback rate effect
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
  }, [rate]);

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentSrc(val);
  };

  const handlePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && (videoRef.current as any).requestPictureInPicture) {
        await (videoRef.current as any).requestPictureInPicture();
      }
    } catch (err) {
      // ignore
    }
  };

  const handleFullscreen = () => {
    const el = videoRef.current as any;
    if (!el) return;
    const container = el.parentElement ?? el;
    if (container.requestFullscreen) container.requestFullscreen();
    else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
  };

  return (
    <div className={`relative bg-black rounded-md overflow-hidden ${className}`}>
      {/* Controls bar on top */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
        {sources && sources.length > 0 && (
          <select
            aria-label="Quality"
            className="text-sm p-1 rounded bg-black/60 text-white"
            onChange={handleQualityChange}
            value={currentSrc ?? ""}
          >
            {sources.map((s) => (
              <option key={s.src} value={s.src}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <video ref={videoRef} className="w-full h-full bg-black" poster={poster} controls={controls} playsInline>
        {/* captions/tracks */}
        {captions &&
          captions.map((c, idx) => (
            <track
              key={idx}
              kind="subtitles"
              srcLang={c.srclang ?? "en"}
              label={c.label ?? `cc-${idx}`}
              src={c.src}
              default={!!c.default}
            />
          ))}
      </video>

      {/* bottom-right utility controls */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-black/60 rounded p-1">
          <button onClick={handlePip} title="Picture-in-Picture" className="px-2 py-1 text-xs rounded hover:bg-white/5">
            PiP
          </button>
          <button onClick={handleFullscreen} title="Fullscreen" className="px-2 py-1 text-xs rounded hover:bg-white/5">
            ⛶
          </button>
          <label className="flex items-center gap-1 text-xs px-2">
            <span className="sr-only">Speed</span>
            <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="text-xs bg-transparent">
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </label>
        </div>
      </div>

      {/* loading / error overlays */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="rounded bg-black/70 px-3 py-2 text-sm">Buffering…</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-red-800/90 text-white p-3 rounded">Error: {error}</div>
        </div>
      )}
    </div>
  );
}
