export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import util from "util";
import { NextResponse, type NextRequest } from "next/server";
import {
  makeProviders,
  makeStandardFetcher,
  makeSimpleProxyFetcher,
  targets,
} from "@p-stream/providers";

const LOG_FILE = path.join(process.cwd(), ".next/server/logs/api-scrape.log");

// Ensure .next/server/logs exists
function ensureLogDir() {
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  } catch {}
}

function log(...args: any[]) {
  const msg = `[${new Date().toISOString()}] ${args
    .map((a) => {
      // pretty-print objects concisely for log file
      if (typeof a === "object") {
        try {
          return JSON.stringify(a, null, 2);
        } catch {
          // fallback to util.inspect for circular objects
          return util.inspect(a, { depth: 4 });
        }
      }
      return String(a);
    })
    .join(" ")}`;
  console.log(msg);
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, msg + "\n", "utf8");
  } catch {}
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function mapTarget(t?: string) {
  if (!t) return targets.NATIVE;
  const key = t.toLowerCase();
  switch (key) {
    case "browser":
      return targets.BROWSER;
    case "extension":
    case "browser_extension":
      return targets.BROWSER_EXTENSION;
    case "any":
      return targets.ANY;
    default:
      return targets.NATIVE;
  }
}

/**
 * Fetch TMDB external IDs (IMDB id) -- tmdbType should be 'movie' or 'tv'
 */
async function fetchImdbIdFromTmdb(tmdbId: string, tmdbType: string = "movie") {
  const TMDB_KEY = process.env.TMDB_API_KEY;
  const base = `https://api.themoviedb.org/3/${tmdbType}/${encodeURIComponent(
    tmdbId
  )}/external_ids`;

  if (!TMDB_KEY) return { ok: false, error: "TMDB_API_KEY not configured" };

  try {
    const urlWithKey = `${base}?api_key=${encodeURIComponent(TMDB_KEY)}`;
    let res = await fetch(urlWithKey, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const j = await res.json();
      const imdbId = j?.imdb_id ?? j?.external_ids?.imdb_id ?? null;
      return { ok: true, imdbId };
    }

    // fallback: try using bearer token
    res = await fetch(base, {
      headers: { Authorization: `Bearer ${TMDB_KEY}`, Accept: "application/json" },
    });

    if (res.ok) {
      const j = await res.json();
      const imdbId = j?.imdb_id ?? j?.external_ids?.imdb_id ?? null;
      return { ok: true, imdbId };
    }

    const text = await res.text().catch(() => "");
    return { ok: false, error: `TMDB fetch failed: ${res.status} - ${text}` };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

/**
 * Fetch release year from TMDB -- tmdbType should be 'movie' or 'tv'
 */
async function fetchReleaseYearFromTmdb(tmdbId: string, tmdbType: string = "movie") {
  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) return { ok: false, error: "TMDB_API_KEY not configured" };

  const base = `https://api.themoviedb.org/3/${tmdbType}/${encodeURIComponent(
    tmdbId
  )}?api_key=${encodeURIComponent(TMDB_KEY)}`;

  try {
    const res = await fetch(base, { headers: { Accept: "application/json" } });
    if (!res.ok) return { ok: false, error: `TMDB ${res.status}` };

    const j = await res.json();
    // for TV shows TMDB uses `first_air_date`
    const date = tmdbType === "tv" ? j.first_air_date || j.release_date : j.release_date || j.first_air_date;
    const year = date ? parseInt(date.substring(0, 4)) : null;

    return { ok: true, year };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

/**
 * Helpers to sanitize stream objects into JSON-serializable primitives
 */
function headersToObject(h: any): Record<string, string> | undefined {
  if (!h) return undefined;
  try {
    // If it's a Headers instance with forEach
    if (typeof h.forEach === "function") {
      const out: Record<string, string> = {};
      try {
        h.forEach((v: any, k: any) => {
          out[String(k)] = String(v);
        });
        return out;
      } catch {}
    }
    // If it has entries()
    if (typeof h.entries === "function") {
      const out: Record<string, string> = {};
      for (const [k, v] of h.entries()) {
        out[String(k)] = Array.isArray(v) ? v.join("; ") : String(v);
      }
      return out;
    }
    // If node-fetch Headers exposes raw()
    if (typeof h.raw === "function") {
      const raw = h.raw();
      const out: Record<string, string> = {};
      for (const key of Object.keys(raw)) {
        out[key] = Array.isArray(raw[key]) ? raw[key].join("; ") : String(raw[key]);
      }
      return out;
    }
    // Plain object
    if (typeof h === "object") {
      const out: Record<string, string> = {};
      for (const k of Object.keys(h)) {
        const v = (h as any)[k];
        out[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      return out;
    }
  } catch {}
  return undefined;
}

function sanitizeSingleStream(s: any) {
  if (!s || typeof s !== "object") return s;
  const out: any = { ...s };

  if (s.playlist) out.playlist = String(s.playlist);
  out.headers = headersToObject(s.headers);
  out.preferredHeaders = headersToObject(s.preferredHeaders);

  if (s.qualities && typeof s.qualities === "object") {
    const qOut: Record<string, any> = {};
    for (const k of Object.keys(s.qualities)) {
      const val = s.qualities[k];
      if (val && typeof val === "object") {
        qOut[k] = { ...val };
        if (val.url) qOut[k].url = String(val.url);
      } else if (typeof val === "string") {
        qOut[k] = { url: val };
      } else {
        qOut[k] = val;
      }
    }
    out.qualities = qOut;
  }

  // ensure flags/captions are JSON-friendly
  if (Array.isArray(out.flags)) out.flags = out.flags.map((f: any) => String(f));
  if (Array.isArray(out.captions)) out.captions = out.captions.map((c: any) => (typeof c === "string" ? c : c));

  return out;
}

function sanitizeStream(stream: any) {
  if (!stream) return null;
  if (Array.isArray(stream)) return stream.map((s) => sanitizeSingleStream(s));
  return sanitizeSingleStream(stream);
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  ensureLogDir();

  try {
    const body = await req.json().catch(() => null);
    if (!body)
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders() }
      );

    const {
      media,
      sourceOrder,
      embedOrder,
      proxyUrl,
      target,
      consistentIpForRequests,
      action,
      id,
      url,
    } = body as any;

    log("🚀 /api/scrape request received", body);

    if (!media?.type)
      return NextResponse.json(
        { error: "media.type is required" },
        { status: 400, headers: corsHeaders() }
      );

    // --- Normalize correctly for both TMDB and p-stream:
    // p-stream providers expect media.type to be "movie" | "show"
    // TMDB endpoints expect "movie" | "tv"
    let tmdbType = "movie";
    const rawType = String(media.type || "").toLowerCase();

    if (["show", "series", "tv"].includes(rawType)) {
      media.type = "show"; // used by p-stream providers
      tmdbType = "tv";     // used for TMDB API calls
    } else {
      media.type = "movie";
      tmdbType = "movie";
    }

    // Keep original tmdbType handy in media so other logic can use it if needed
    media.tmdbType = tmdbType;

    // --- Normalize media shape for p-stream providers (TV shows need nested season/episode objects)
    function normalizeMediaForProviders(media: any) {
      // Ensure tmdbId is a string (p-stream expects strings in many places)
      if (media.tmdbId != null) media.tmdbId = String(media.tmdbId);

      // Normalise TV shape to { season: { number }, episode: { number } }
      if (media.type === 'show') {
        // convert plain season/episode numeric fields to nested objects if needed
        if (media.season != null && (typeof media.season === 'number' || typeof media.season === 'string')) {
          media.season = { number: Number(media.season) };
        } else if (media.season && typeof media.season === 'object' && media.season.number == null) {
          // accept media.seasonNumber as alternate field
          if (media.seasonNumber != null) media.season.number = Number(media.seasonNumber);
        } else if (!media.season) {
          // ensure property exists (some scrapers require season object even for shows)
          media.season = { number: undefined };
        }

        if (media.episode != null && (typeof media.episode === 'number' || typeof media.episode === 'string')) {
          media.episode = { number: Number(media.episode) };
        } else if (media.episode && typeof media.episode === 'object' && media.episode.number == null) {
          if (media.episodeNumber != null) media.episode.number = Number(media.episodeNumber);
        } else if (!media.episode) {
          media.episode = { number: undefined };
        }

        // Optionally, map seasonTmdbId / episodeTmdbId to nested shapes if provided
        if (media.seasonTmdbId) media.season.tmdbId = String(media.seasonTmdbId);
        if (media.episodeTmdbId) media.episode.tmdbId = String(media.episodeTmdbId);
      }

      return media;
    }

    if (!media.tmdbId && !media.title)
      return NextResponse.json(
        { error: "media must include tmdbId or title" },
        { status: 400, headers: corsHeaders() }
      );

    // --- Enrich IMDb ID ---
    if (media.tmdbId && !media.imdbId) {
      const tmdbRes = await fetchImdbIdFromTmdb(String(media.tmdbId), tmdbType);
      if (tmdbRes.ok && tmdbRes.imdbId) {
        media.imdbId = tmdbRes.imdbId;
        log(`[api/scrape] enriched imdbId=${media.imdbId}`);
      } else {
        log(`[api/scrape] IMDb ID enrichment failed`, tmdbRes.error);
      }
    }

    // --- Enrich release year ---
    if (media.tmdbId && !media.releaseYear) {
      const yearRes = await fetchReleaseYearFromTmdb(String(media.tmdbId), tmdbType);
      if (yearRes.ok && yearRes.year) {
        media.releaseYear = yearRes.year;
        log(`[api/scrape] enriched releaseYear=${media.releaseYear}`);
      } else {
        log(`[api/scrape] releaseYear lookup failed`, yearRes.error);
      }
    }

    // Normalize media shape for p-stream providers (TV shows need nested season/episode objects)
    try {
      normalizeMediaForProviders(media);
    } catch (e) {
      log('Warning: normalizeMediaForProviders failed', String(e));
    }

    // Build providers
    log("🔧 Initializing providers...");
    const fetcher = makeStandardFetcher(fetch);
    const providers = makeProviders({
      fetcher,
      proxiedFetcher: proxyUrl ? makeSimpleProxyFetcher(proxyUrl, fetch) : undefined,
      target: mapTarget(target),
      consistentIpForRequests: !!consistentIpForRequests,
    });

    // Debug: list available sources/embeds (helpful when troubleshooting TV-specific scrapers)
    try {
      const sources = providers.listSources?.()?.map((s: any) => `${s.id}@${s.rank}`) || [];
      const embeds = providers.listEmbeds?.()?.map((e: any) => `${e.id}@${e.rank}`) || [];
      log('Available sources:', sources);
      log('Available embeds:', embeds);
    } catch (e) {
      // ignore
    }

    const runnerOptions: any = {
      media,
      events: {
        onStart: (id: string) => log(`🟡 Starting provider: ${id}`),
        onResult: (id: string, res: any) =>
          log(`✅ Provider ${id} returned a result`, {
            hasStream: !!res?.stream,
            hasEmbeds: !!res?.embeds?.length,
          }),
        onError: (id: string, err: any) =>
          log(`❌ Provider ${id} failed`, err?.message || err),
      },
    };
    if (sourceOrder) runnerOptions.sourceOrder = sourceOrder;
    if (embedOrder) runnerOptions.embedOrder = embedOrder;

    // --- Run ---
    if (!action || action === "runAll") {
      log("▶ Running all providers...");
      const output = await providers.runAll(runnerOptions);

      const resultKeys = Object.keys(output || {});
      log("✅ runAll completed", {
        duration: Date.now() - started,
        resultKeys,
      });

      // --- DEBUG: log raw output (deep inspect) ---
      try {
        log("DEBUG raw provider output (inspect):", util.inspect(output, { depth: 6 }));
      } catch (e) {
        log("DEBUG raw provider output (json fallback):", output);
      }

      // sanitize the stream so headers/complex objects become plain JSON-friendly values
      const sanitizedStream = sanitizeStream(output?.stream);
      try {
        log("DEBUG sanitized stream:", JSON.stringify(sanitizedStream, null, 2));
      } catch {
        log("DEBUG sanitized stream (inspect):", util.inspect(sanitizedStream, { depth: 6 }));
      }

      if (!output || !output.stream) {
        log("⚠️ No results from any provider for media:", media);
        return NextResponse.json(
          { ok: false, message: "no stream found" },
          { status: 404, headers: corsHeaders() }
        );
      }

      // Make caption extraction robust: stream.captions can be an array or an object in some outputs
      let captions: any[] = [];
      const sc = output.stream?.captions;
      if (Array.isArray(sc)) captions = sc;
      else if (sc && typeof sc === "object") {
        captions = Object.values(sc).flat();
      }

      log("🗣️ Found captions:", captions.map((c: any) => c.language));

      // Return both shapes: top-level .stream (sanitized) and a wrapped .output to support clients expecting either
      return NextResponse.json(
        {
          ok: true,
          // safe JSON-friendly stream
          stream: sanitizedStream,
          // legacy/alternate shape for clients expecting `.output.stream`
          output: {
            stream: sanitizedStream,
            sourceId: output.sourceId,
            embedId: output.embedId,
          },
          captions,
        },
        { status: 200, headers: corsHeaders() }
      );
    }

    // --- Source / Embed runners ---
    if (action === "runSource") {
      log(`▶ Running source scraper: ${id}`);
      const output = await providers.runSourceScraper({ id, media });
      log("✅ Source result", util.inspect(output, { depth: 4 }));
      if ((!output.stream?.length && !output.embeds?.length))
        return NextResponse.json(
          { ok: false, message: "source found nothing" },
          { status: 404, headers: corsHeaders() }
        );
      const sanitized = sanitizeStream(output.stream);
      return NextResponse.json({ ok: true, output: { stream: sanitized, embeds: output.embeds } }, { status: 200, headers: corsHeaders() });
    }

    if (action === "runEmbed") {
      log(`▶ Running embed scraper: ${id}`, { url });
      const output = await providers.runEmbedScraper({ id, url });
      log("✅ Embed result", util.inspect(output, { depth: 4 }));
      if (!output?.stream?.length)
        return NextResponse.json(
          { ok: false, message: "embed found no streams" },
          { status: 404, headers: corsHeaders() }
        );
      const sanitized = sanitizeStream(output.stream);
      return NextResponse.json({ ok: true, output: { stream: sanitized } }, { status: 200, headers: corsHeaders() });
    }

    return NextResponse.json({ error: "Unsupported operation" }, { status: 400, headers: corsHeaders() });
  } catch (err: any) {
    log("❌ /api/scrape error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500, headers: corsHeaders() }
    );
  } finally {
    log(`🕓 Completed /api/scrape in ${Date.now() - started}ms`);
  }
}
