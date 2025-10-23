export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import {
  makeProviders,
  makeStandardFetcher,
  makeSimpleProxyFetcher,
  targets,
} from "@p-stream/providers";

/*
  POST /api/scrape

  Expected JSON body (examples):

  1) Run all providers (recommended)
  {
    "media": { "type": "movie", "title": "Matrix", "tmdbId": "603", "releaseYear": 1999 },
    "sourceOrder": ["flixhq"],          // optional
    "embedOrder": ["turbovid"],         // optional
    "proxyUrl": "https://your.proxy.workers.dev/", // optional: used to create proxied fetcher
    "target": "native",                 // optional: native | browser | extension | any (default: native)
    "consistentIpForRequests": false     // optional
  }

  2) Run a specific source scraper by id
  {
    "action": "runSource",
    "id": "catflix",
    "media": { ... }
  }

  3) Run an embed scraper directly
  {
    "action": "runEmbed",
    "id": "turbovid",
    "url": "https://turbovid.eu/embed/abcd"
  }

  Response: JSON with the raw output from the provider controls (RunOutput or SourcererOutput / EmbedOutput)
*/

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
      return targets.NATIVE; // native is the safe default
  }
}

async function fetchImdbIdFromTmdb(tmdbId: string, type: string = "movie") {
  const base = `https://api.themoviedb.org/3/${type}/${encodeURIComponent(tmdbId)}/external_ids`;
  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) {
    return { ok: false, error: "TMDB_API_KEY not configured" };
  }

  try {
    // Try v3 api_key first
    const urlWithKey = `${base}?api_key=${encodeURIComponent(TMDB_KEY)}`;
    let res = await fetch(urlWithKey, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const j = await res.json();
      const imdbId = j?.imdb_id ?? (j?.external_ids && j.external_ids.imdb_id) ?? null;
      return { ok: true, imdbId };
    }

    // Fallback to bearer (v4)
    res = await fetch(base, {
      headers: {
        Authorization: `Bearer ${TMDB_KEY}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const j = await res.json();
      const imdbId = j?.imdb_id ?? (j?.external_ids && j.external_ids.imdb_id) ?? null;
      return { ok: true, imdbId };
    }

    const text = await res.text().catch(() => "");
    return { ok: false, error: `TMDB fetch failed: ${res.status} - ${text}` };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400, headers: corsHeaders() }
      );
    }

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

    if (action && action !== "runAll" && action !== "runSource" && action !== "runEmbed") {
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Basic validation for media when required
    if (action !== "runEmbed") {
      if (!media || !media.type) {
        return NextResponse.json(
          { error: "media object with a valid 'type' is required" },
          { status: 400, headers: corsHeaders() }
        );
      }

      if (!media.tmdbId && !media.title) {
        return NextResponse.json(
          { error: "media must contain at least a tmdbId or a title" },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // Enrich media with IMDb id when possible
    if (media && media.tmdbId && !media.imdbId) {
      // Determine tmdb type: accept 'tv' | 'show' or 'movie'
      const typeParam = (media.type || "movie").toLowerCase();
      const tmdbType = typeParam === "tv" || typeParam === "show" ? "tv" : "movie";

      try {
        const tmdbRes = await fetchImdbIdFromTmdb(String(media.tmdbId), tmdbType);
        if (tmdbRes.ok && tmdbRes.imdbId) {
          // Attach imdbId to media object for downstream scrapers
          media.imdbId = tmdbRes.imdbId;
          console.log(`[api/scrape] enriched media.tmdbId=${media.tmdbId} -> imdbId=${media.imdbId}`);
        } else {
          console.warn(`[api/scrape] failed to fetch imdb id for tmdbId=${media.tmdbId}: ${tmdbRes.error}`);
        }
      } catch (err) {
        console.warn("[api/scrape] error while fetching imdb id:", err);
      }
    }

    // Build fetchers
    const fetcher = makeStandardFetcher(fetch);
    const providers = makeProviders({
      fetcher,
      proxiedFetcher: proxyUrl ? makeSimpleProxyFetcher(proxyUrl, fetch) : undefined,
      target: mapTarget(target),
      consistentIpForRequests: !!consistentIpForRequests,
    });

    // Common runner options
    const runnerOptions: any = {};
    if (sourceOrder) runnerOptions.sourceOrder = sourceOrder;
    if (embedOrder) runnerOptions.embedOrder = embedOrder;
    if (media) runnerOptions.media = media;

    // Handle actions
    if (!action || action === "runAll") {
      // Run all providers according to rank and optionally source/embed overrides
      const output = await providers.runAll(runnerOptions);

      if (!output) {
        return NextResponse.json(
          { ok: false, message: "no stream found (output is null)" },
          { status: 404, headers: corsHeaders() }
        );
      }

      return NextResponse.json({ ok: true, output }, { status: 200, headers: corsHeaders() });
    }

    if (action === "runSource") {
      if (!id) {
        return NextResponse.json(
          { error: "Missing 'id' for runSource" },
          { status: 400, headers: corsHeaders() }
        );
      }

      try {
        const output = await providers.runSourceScraper({ id, media });
        // If no streams or embeds
        if ((!output.stream || output.stream.length === 0) && (!output.embeds || output.embeds.length === 0)) {
          return NextResponse.json(
            { ok: false, message: "source found nothing" },
            { status: 404, headers: corsHeaders() }
          );
        }

        return NextResponse.json({ ok: true, output }, { status: 200, headers: corsHeaders() });
      } catch (err: any) {
        // Try to surface NotFound-like errors
        const message = err?.message || String(err);
        return NextResponse.json(
          { ok: false, error: message },
          { status: 500, headers: corsHeaders() }
        );
      }
    }

    if (action === "runEmbed") {
      if (!id || !url) {
        return NextResponse.json(
          { error: "Missing 'id' or 'url' for runEmbed" },
          { status: 400, headers: corsHeaders() }
        );
      }

      try {
        const output = await providers.runEmbedScraper({ id, url });
        if (!output || !output.stream || output.stream.length === 0) {
          return NextResponse.json(
            { ok: false, message: "embed found no streams" },
            { status: 404, headers: corsHeaders() }
          );
        }

        return NextResponse.json({ ok: true, output }, { status: 200, headers: corsHeaders() });
      } catch (err: any) {
        const message = err?.message || String(err);
        return NextResponse.json(
          { ok: false, error: message },
          { status: 500, headers: corsHeaders() }
        );
      }
    }

    // fallback
    return NextResponse.json(
      { error: "Unsupported operation" },
      { status: 400, headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error("/api/scrape error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500, headers: corsHeaders() }
    );
  }
}
