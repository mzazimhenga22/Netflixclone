
"use client";

import React, { useEffect, useState, useRef } from "react";
import type { Movie } from "@/types";
import Image from 'next/image';

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
        cast: { cast_id: number; credit_id: string; name: string; character: string, profile_path: string | null }[];
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


  const onClose = () => {
    setShowOverlay(false);
  };

  if (!showOverlay) return null;

  if (!details) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
        {/* Minimal loading indicator that doesn't obscure the screen */}
      </div>
    );
  }

  const backdropUrl = buildImageUrl(config, details.backdrop_path, "w1280") ||
                      buildImageUrl(config, details.poster_path, "w780");

  const topCast = (details?.credits?.cast || []).slice(0, 4);

  return (
    <div
      className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 pointer-events-auto animate-in fade-in-0 duration-700"
      style={{ zIndex: 60 }}
      onClick={onClose}
    >
      <div className="relative h-full w-full">
        {backdropUrl && (
            <Image src={backdropUrl} alt={details.title || details.name || 'Backdrop'} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/80 to-black"></div>
      </div>
      
      <div className="relative h-full w-full bg-black/80 backdrop-blur-sm p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-xl text-white">
            <h2 className="text-3xl lg:text-5xl font-black">{details.title || details.name}</h2>
            <div className="flex items-center gap-4 text-muted-foreground mt-2 text-lg">
                <span>{details.release_date?.slice(0,4) || details.first_air_date?.slice(0,4)}</span>
                <span className="border px-2 rounded-sm text-base">{details.certification || '16+'}</span>
                 <span className="text-green-400 font-semibold">{(details.vote_average * 10).toFixed(0)}% Match</span>
            </div>

            <p className="mt-4 text-base lg:text-lg line-clamp-4">{details.overview}</p>

            <div className="mt-8">
              <h4 className="text-sm uppercase font-semibold text-muted-foreground mb-3">Cast</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {topCast.map(c => (
                    <div key={c.cast_id || c.credit_id} className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                            {c.profile_path && config && (
                                <Image src={`${config.images.secure_base_url}w185${c.profile_path}`} alt={c.name} width={40} height={40} className="object-cover" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.character}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef?.current;
                  if (v) v.play();
                  setShowOverlay(false);
                }}
                className="bg-white text-black px-6 py-2 rounded-md font-bold text-lg hover:bg-white/80 transition-colors"
              >
                Resume
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://www.themoviedb.org/${media.media_type}/${media.id}`, "_blank");
                }}
                className="border border-white/50 text-white px-6 py-2 rounded-md font-bold text-lg bg-black/40 hover:bg-white/10 transition-colors"
              >
                More Info
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
