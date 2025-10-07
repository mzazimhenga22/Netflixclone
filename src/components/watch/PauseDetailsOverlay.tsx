
"use client";

import React, { useEffect, useState, useRef } from "react";
import type { Movie } from "@/types";

const API_KEY = '1ba41bda48d0f1c90954f4811637b6d6';

interface PauseDetailsOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  media: Movie;
  delayMs?: number;
}

interface TmdbConfig {
    images: {
        secure_base_url: string;
    }
}

interface TmdbDetails extends Movie {
    credits?: {
        cast: { cast_id: number; credit_id: string; name: string; character: string }[];
    };
}


function buildImageUrl(config: TmdbConfig | null, filePath: string | null | undefined, size = "w780") {
  if (!filePath || !config) return null;
  return `${config.images.secure_base_url}${size}${filePath}`;
}

export default function PauseDetailsOverlay({
  videoRef,
  media,
  delayMs = 900,
}: PauseDetailsOverlayProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [details, setDetails] = useState<TmdbDetails | null>(null);
  const [config, setConfig] = useState<TmdbConfig | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const v = videoRef?.current;
    if (!v) return;
    const onPause = () => {
      setIsPaused(true);
      timerRef.current = setTimeout(() => {
        setShowOverlay(true);
      }, delayMs);
    };
    const onPlay = () => {
      setIsPaused(false);
      setShowOverlay(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    v.addEventListener("pause", onPause);
    v.addEventListener("play", onPlay);
    return () => {
      v.removeEventListener("pause", onPause);
      v.removeEventListener("play", onPlay);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [videoRef, delayMs]);

  useEffect(() => {
    let cancelled = false;
    async function fetchConfig() {
      try {
        const r = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${API_KEY}`);
        const json = await r.json();
        if (!cancelled) setConfig(json);
      } catch (err) {
        console.warn("Failed to load TMDB config", err);
      }
    }
    fetchConfig();
    return () => { cancelled = true };
  }, []);

  useEffect(() => {
    if (!showOverlay || !media.id) return;
    const mediaType = media.media_type || 'movie';
    const key = `${mediaType}:${media.id}`;
    if (cacheRef.current.has(key)) {
      setDetails(cacheRef.current.get(key));
      return;
    }

    let cancelled = false;
    async function fetchDetails() {
      try {
        const url = `https://api.themoviedb.org/3/${mediaType}/${media.id}?api_key=${API_KEY}&append_to_response=credits,videos,images`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        cacheRef.current.set(key, json);
        setDetails(json);
      } catch (e) {
        console.error("Failed to fetch TMDB details", e);
      }
    }
    fetchDetails();
    return () => { cancelled = true };
  }, [showOverlay, media.id, media.media_type]);

  const topCast = (details?.credits?.cast || []).slice(0, 4);

  const onClose = () => {
    setShowOverlay(false);
  };

  if (!showOverlay) return null;

  if (!details) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
        <div className="bg-black bg-opacity-60 text-white p-6 rounded-md">Loading details…</div>
      </div>
    );
  }

  const backdropUrl = buildImageUrl(config, details.backdrop_path, "w1280") ||
                      buildImageUrl(config, details.poster_path, "w780");

  return (
    <div
      className="absolute inset-0 flex items-end md:items-center justify-center pointer-events-auto"
      style={{ zIndex: 60 }}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
      />
      <div className="relative max-w-4xl w-full m-6 rounded-md overflow-hidden animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-stretch bg-gradient-to-t from-black via-black/90 to-black/80 p-6">
          <div className="flex-shrink-0">
            {backdropUrl ? (
              <img src={backdropUrl} alt={details.title || details.name} className="w-48 md:w-64 rounded-md shadow-lg" />
            ) : (
              <div className="w-48 md:w-64 h-32 md:h-40 bg-gray-800 rounded-md" />
            )}
          </div>

          <div className="ml-4 md:ml-6 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg md:text-2xl font-semibold">
                {details.title || details.name}
                <span className="text-gray-400 text-sm ml-2">
                  {details.release_date ? `(${details.release_date.slice(0,4)})` : details.first_air_date ? `(${details.first_air_date.slice(0,4)})` : ""}
                </span>
              </h3>
              <button onClick={onClose} className="text-gray-300 hover:text-white">Close ✕</button>
            </div>

            <p className="text-gray-300 mt-2 line-clamp-4">{details.overview}</p>

            <div className="mt-4">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Top cast</div>
              <div className="flex gap-3">
                {topCast.map((c) => (
                  <div key={c.cast_id || c.credit_id} className="text-xs text-gray-200">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-gray-400">{c.character}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const v = videoRef?.current;
                  if (v) v.play();
                  setShowOverlay(false);
                }}
                className="bg-white text-black px-4 py-2 rounded-md font-semibold"
              >
                Resume
              </button>

              <button
                onClick={() => {
                  window.open(`https://www.themoviedb.org/${media.media_type}/${media.id}`, "_blank");
                }}
                className="border border-gray-600 text-white px-4 py-2 rounded-md"
              >
                More info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
