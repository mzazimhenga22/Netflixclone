"use client";

import React, { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";

interface WatchPageProps {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: { season?: string; episode?: string } | Promise<{ season?: string; episode?: string }>;
}

/** Safe base64 for URLs (Unicode-safe) */
function base64EncodeBrowser(input: string): string {
  if (typeof window === "undefined") return Buffer.from(input, "utf8").toString("base64");
  return btoa(unescape(encodeURIComponent(input)));
}

/** Builds full proxied URL */
function proxiedUrlFor(targetUrl?: string): string | undefined {
  if (!targetUrl) return undefined;
  if (targetUrl.startsWith("data:")) return targetUrl;

  const b64 = base64EncodeBrowser(targetUrl);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/proxy?url=${encodeURIComponent(b64)}`;
}

/** Extracts playable stream (HLS or file) */
function extractPlayableUrlFromOutput(output: any): string | undefined {
  if (!output) return;
  const streams = Array.isArray(output.stream)
    ? output.stream
    : output.stream
    ? [output.stream]
    : [];
  for (const s of streams) {
    if (!s) continue;
    if (s.type === "hls" && typeof s.playlist === "string") return proxiedUrlFor(s.playlist);
    if (s.type === "file" && s.qualities && typeof s.qualities === "object") {
      const qualities = s.qualities as Record<string, { url?: string }>;
      const pick = qualities["1080p"]?.url ?? qualities["1080"]?.url ?? Object.values(qualities)[0]?.url;
      if (pick) return proxiedUrlFor(pick);
    }
    if (typeof s.playlist === "string") return proxiedUrlFor(s.playlist);
  }
  if (typeof output.playlist === "string") return proxiedUrlFor(output.playlist);
  return undefined;
}

const WatchPage: React.FC<WatchPageProps> = ({ params, searchParams }) => {
  // Unwrap async params safely
  const resolvedParams = typeof (params as any).then === "function" ? (React as any).use(params) : params;
  const { id } = resolvedParams as { id: string };

  // Unwrap async searchParams safely
  const resolvedSearchParams =
    searchParams && typeof (searchParams as any).then === "function"
      ? (React as any).use(searchParams)
      : searchParams;

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadStream = async () => {
      setLoading(true);
      setError(null);

      try {
        const isTv = resolvedSearchParams?.season && resolvedSearchParams?.episode;
        const mediaType = isTv ? "tv" : "movie";

        const body: any = {
          media: {
            type: mediaType,
            tmdbId: id,
            ...(isTv && {
              season: parseInt(resolvedSearchParams!.season!),
              episode: parseInt(resolvedSearchParams!.episode!),
            }),
          },
        };

        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => res.statusText);
          throw new Error(`Scrape failed: ${res.status} ${msg}`);
        }

        const json = await res.json();
        const playable = extractPlayableUrlFromOutput(json.output);
        if (!playable) throw new Error("No playable HLS stream found");

        const normalized =
          typeof window !== "undefined" && playable.startsWith("/")
            ? `${window.location.origin}${playable}`
            : playable;

        if (active) setVideoSrc(normalized);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) loadStream();
    return () => {
      active = false;
    };
  }, [id, resolvedSearchParams]);

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        Loading stream...
      </div>
    );

  if (error)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-red-400">
        Error: {error}
      </div>
    );

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      {videoSrc ? <VideoPlayer src={videoSrc} /> : <div className="text-white">No stream available</div>}
    </div>
  );
};

export default WatchPage;
