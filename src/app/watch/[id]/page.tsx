"use client";

import React, { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";

interface WatchPageProps {
  // Next.js may pass `params` as a Promise — unwrap it with React.use() in client components
  params: Promise<{ id: string }> | { id: string };
}

/** safe base64 for unicode in browser */
function base64EncodeBrowser(input: string) {
  return typeof window !== "undefined"
    ? btoa(unescape(encodeURIComponent(input)))
    : Buffer.from(input, "utf8").toString("base64");
}

/** return proxied URL (keeps data: URLs as-is) */
function proxiedUrlFor(targetUrl: string) {
  if (!targetUrl) return targetUrl;
  if (targetUrl.startsWith("data:")) return targetUrl;
  // change this to match your proxy path
  const b64 = base64EncodeBrowser(targetUrl);
  return `/api/proxy?url=${encodeURIComponent(b64)}`;
}

function extractPlayableUrlFromOutput(output: any): string | undefined {
  if (!output) return undefined;

  // typical provider shape: output.stream or array
  const streams = Array.isArray(output.stream) ? output.stream : output.stream ? [output.stream] : [];

  for (const s of streams) {
    if (!s) continue;

    // HLS playlist
    if (s.type === "hls" && s.playlist && typeof s.playlist === "string") {
      return proxiedUrlFor(s.playlist);
    }

    // file stream (qualities)
    if (s.type === "file" && s.qualities && typeof s.qualities === "object") {
      const qkeys = Object.keys(s.qualities);
      if (qkeys.length) {
        // try common keys first
        const pick = s.qualities["1080p"]?.url ?? s.qualities["1080"]?.url ?? s.qualities[qkeys[0]]?.url;
        if (pick) return proxiedUrlFor(pick);
      }
    }

    // sometimes providers return { playlist: "...", type: "hls" } directly
    if (s.playlist && typeof s.playlist === "string") {
      return proxiedUrlFor(s.playlist);
    }
  }

  // fallback: top-level output.playlist
  if (output.playlist && typeof output.playlist === "string") {
    return proxiedUrlFor(output.playlist);
  }

  return undefined;
}

const WatchPage: React.FC<WatchPageProps> = ({ params }) => {
  // `params` can be a Promise in newer Next.js versions. Use React.use() to unwrap if needed.
  // Use a safe typed unwrap so TypeScript doesn't complain about the experimental `use` hook.
  const realParams = (React as any).use ? (React as any).use(params) : params;
  const { id } = realParams as { id: string };

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchVideoSource = async () => {
      setLoading(true);
      setError(null);
      setVideoSrc(null);

      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          // server expects a `media` object
          body: JSON.stringify({ media: { type: "movie", tmdbId: id } }),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Scrape failed: ${res.status} ${txt || res.statusText}`);
        }

        const json = await res.json();

        // debug: print full provider output
        console.log("scrape response (watchpage):", json);

        if (!json?.ok || !json?.output) throw new Error("No streams found");

        const playable = extractPlayableUrlFromOutput(json.output);

        // debug: show what URL we will try to load
        console.log("playable URL extracted:", playable);

        if (!playable) throw new Error("No playable stream found in output");

        if (mounted) setVideoSrc(playable);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) fetchVideoSource();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>;

  return (
    <div className="w-full h-[80vh] flex justify-center items-center bg-black">
      {videoSrc ? <VideoPlayer src={videoSrc} /> : <div className="text-white">No source</div>}
    </div>
  );
};

export default WatchPage;
