"use client";

import React, { useEffect, useState } from "react";
import VideoPlayer, { Caption } from "./VideoPlayer";

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
  if (targetUrl.startsWith("/api/proxy")) return targetUrl;
  const b64 = base64EncodeBrowser(targetUrl);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/proxy?url=${encodeURIComponent(b64)}`;
}

/** Preferred: extract playable stream url AND raw captions array from multiple server shapes */
function extractPlayableAndRawCaptions(outputOrTopLevel: any): { playlist?: string; rawCaptions: any[] } {
  if (!outputOrTopLevel) return { playlist: undefined, rawCaptions: [] };
  const top = outputOrTopLevel.output ?? outputOrTopLevel;

  // Build streams array (normalize)
  const streams: any[] = [];
  if (Array.isArray(top?.stream)) streams.push(...top.stream);
  else if (top?.stream) streams.push(top.stream);

  // find playlist
  const pickFromQualities = (qualities: unknown): string | undefined => {
    if (!qualities || typeof qualities !== "object") return undefined;
    const qObj = qualities as Record<string, any>;
    if (typeof qObj["1080p"]?.url === "string") return qObj["1080p"].url;
    if (typeof qObj["1080"]?.url === "string") return qObj["1080"].url;
    const vals = Object.values(qObj);
    for (const v of vals) {
      if (!v) continue;
      if (typeof v === "string") return v;
      if (typeof v === "object") {
        if (typeof v.url === "string") return v.url;
        if (typeof v.src === "string") return v.src;
        if (typeof v.file === "string") return v.file;
      }
    }
    return undefined;
  };

  for (const s of streams) {
    if (!s || typeof s !== "object") continue;
    if (s.type === "hls" && typeof s.playlist === "string") {
      return { playlist: String(s.playlist), rawCaptions: collectCaptions(top, s) };
    }
    if (s.type === "file" && s.qualities) {
      const pick = pickFromQualities(s.qualities);
      if (pick) return { playlist: pick, rawCaptions: collectCaptions(top, s) };
    }
    if (typeof s.playlist === "string") return { playlist: s.playlist, rawCaptions: collectCaptions(top, s) };
    if (s.qualities) {
      const pick = pickFromQualities(s.qualities);
      if (pick) return { playlist: pick, rawCaptions: collectCaptions(top, s) };
    }
  }

  // top-level playlist fallback
  if (typeof top?.playlist === "string") return { playlist: top.playlist, rawCaptions: collectCaptions(top) };

  return { playlist: undefined, rawCaptions: collectCaptions(top) };
}

/** Collect captions from multiple places: top.captions, stream.captions, output.captions; normalize to array */
function collectCaptions(top: any, stream?: any): any[] {
  // priority: stream.captions -> top.captions -> top.captions (alternate shapes)
  const candidates: any[] = [];

  const addIf = (v: any) => {
    if (!v) return;
    if (Array.isArray(v)) candidates.push(...v);
    else if (typeof v === "object") {
      // object might be mapping language -> array
      const maybeArrs = Object.values(v).flatMap((x: any) => (Array.isArray(x) ? x : [x]));
      candidates.push(...maybeArrs);
    } else if (typeof v === "string") {
      candidates.push(v);
    }
  };

  addIf(stream?.captions ?? stream?.subtitles);
  addIf(top?.stream?.captions ?? top?.stream?.subtitles);
  addIf(top?.captions ?? top?.subtitles);
  addIf(top?.output?.captions ?? top?.output?.subtitles);
  // dedupe
  return Array.from(new Set(candidates));
}

/** Normalize a raw caption entry into { label, language, url } or undefined */
function normalizeCaptionEntry(raw: any): { label: string; language?: string; url?: string } | undefined {
  if (!raw) return undefined;
  // raw could be a string (URL)
  if (typeof raw === "string") {
    return { label: "Subtitle", language: "und", url: raw };
  }
  // raw could be { url, src, uri, file, track, vtt } etc
  const url = (raw.url || raw.src || raw.uri || raw.file || raw.track || raw.vtt || raw.path) as string | undefined;
  if (!url && typeof raw === "object") {
    // Sometimes languages map to arrays of simple strings, already handled earlier, but double-check nested
    // Try to find the first string-like property
    for (const k of Object.keys(raw)) {
      const v = (raw as any)[k];
      if (typeof v === "string" && (v.startsWith("http") || v.startsWith("/"))) {
        return { label: raw.label ?? raw.name ?? "Subtitle", language: raw.language ?? raw.lang ?? raw.srclang, url: v };
      }
    }
    return undefined;
  }
  const label = raw.label || raw.name || raw.title || raw.languageName || raw.langName || raw.language || raw.srclang || "Subtitle";
  const language = raw.language || raw.lang || raw.srclang || raw.locale || undefined;
  return { label: String(label), language: language ? String(language) : undefined, url: url ? String(url) : undefined };
}

/** Convert SRT -> WEBVTT (very small client-side converter) */
function srtToVtt(srtText: string): string {
  // remove CR, ensure unix newlines
  let t = srtText.replace(/\r/g, "");
  // remove leading sequence numbers lines (lines that contain only digits)
  t = t
    .split("\n")
    .filter((line) => !/^\d+$/.test(line.trim()))
    .join("\n");
  // replace comma in timestamps with dot (00:00:01,600 -> 00:00:01.600)
  t = t.replace(/(\d{2}:\d{2}:\d{2}),(\d{1,3})/g, (_, a, b) => `${a}.${b.padEnd(3, "0")}`);
  // prepend WEBVTT
  if (!t.startsWith("WEBVTT")) t = "WEBVTT\n\n" + t;
  return t;
}

/** Fetch caption via proxied URL and convert if needed (SRT -> Blob VTT URL). Returns final usable URL or undefined. */
async function fetchAndPrepareCaptionUrl(proxiedUrl?: string): Promise<string | undefined> {
  if (!proxiedUrl) return undefined;
  try {
    const res = await fetch(proxiedUrl);
    if (!res.ok) return undefined;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const text = await res.text();
    // if already vtt (WEBVTT header) or content-type is vtt -> create blob and return object URL
    if (text.trim().startsWith("WEBVTT") || ct.includes("vtt")) {
      const blob = new Blob([text], { type: "text/vtt" });
      return URL.createObjectURL(blob);
    }
    // if srt (common) -> convert to VTT
    if (ct.includes("text/srt") || ct.includes("application/x-subrip") || /\.srt($|\?)/i.test(proxiedUrl) || text.match(/\d{2}:\d{2}:\d{2},\d{3}/)) {
      const vtt = srtToVtt(text);
      const blob = new Blob([vtt], { type: "text/vtt" });
      return URL.createObjectURL(blob);
    }
    // fallback: if text present but unknown format, still try to return VTT blob by naive wrap (less reliable)
    if (text.length > 0) {
      const vtt = srtToVtt(text);
      const blob = new Blob([vtt], { type: "text/vtt" });
      return URL.createObjectURL(blob);
    }
    return undefined;
  } catch (e) {
    console.warn("Caption fetch/convert failed:", e);
    return undefined;
  }
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
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadStream = async () => {
      setLoading(true);
      setError(null);
      setCaptions([]);

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

        // Extract both playlist and raw caption entries
        const { playlist, rawCaptions } = extractPlayableAndRawCaptions(json.output ?? json);
        if (!playlist) throw new Error("No playable HLS stream found");

        // normalize playlist (proxied)
        const playable = proxiedUrlFor(String(playlist));
        const normalized =
          typeof window !== "undefined" && playable && playable.startsWith("/")
            ? `${window.location.origin}${playable}`
            : playable;

        // Normalize caption entries and fetch/convert if needed
        const normalizedRaw = (rawCaptions || [])
          .map(normalizeCaptionEntry)
          .filter((c): c is { label: string; language?: string; url?: string } => !!c && !!c.url);

        // prepare promises to fetch/convert each caption
        const prepared: Promise<Caption | undefined>[] = normalizedRaw.map(async (c) => {
          const proxied = proxiedUrlFor(c.url);
          // fetch proxied caption, convert if necessary, return usable URL (blob or proxied)
          const finalUrl = await fetchAndPrepareCaptionUrl(proxied);
          if (!finalUrl) return undefined;
          return { label: c.label || "Subtitle", language: c.language || "und", url: finalUrl };
        });

        const preparedResults = await Promise.all(prepared);
        const finalCaptions = preparedResults.filter(Boolean) as Caption[];

        if (active) {
          setVideoSrc(normalized ?? null);
          setCaptions(finalCaptions);
        }
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
      {videoSrc ? <VideoPlayer src={videoSrc} captions={captions} /> : <div className="text-white">No stream available</div>}
    </div>
  );
};

export default WatchPage;
