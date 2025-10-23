// src/app/api/tmdb/imdb/route.ts
import { NextResponse, type NextRequest } from "next/server";

async function fetchExternalIds(tmdbId: string, type: "movie" | "tv") {
  const base = `https://api.themoviedb.org/3/${type}/${encodeURIComponent(tmdbId)}/external_ids`;
  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) {
    return { ok: false, error: "TMDB_API_KEY not configured" };
  }

  // Try v3 api_key first (most common)
  try {
    const urlWithKey = `${base}?api_key=${encodeURIComponent(TMDB_KEY)}`;
    let res = await fetch(urlWithKey, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const j = await res.json();
      return { ok: true, json: j };
    }

    // If api_key failed, try Bearer style (v4)
    res = await fetch(base, {
      headers: {
        Authorization: `Bearer ${TMDB_KEY}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const j = await res.json();
      return { ok: true, json: j };
    }

    const text = await res.text().catch(() => "");
    return { ok: false, error: `TMDB fetch failed: ${res.status} - ${text}` };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("[api] TMDB_API_KEY available:", !!process.env.TMDB_API_KEY);

    const url = new URL(req.url);
    const tmdbId = url.searchParams.get("tmdbId");
    const typeParam = (url.searchParams.get("type") || "movie").toLowerCase();

    if (!tmdbId) {
      return NextResponse.json({ error: "missing tmdbId" }, { status: 400 });
    }

    const type = typeParam === "tv" || typeParam === "show" ? "tv" : "movie";

    const result = await fetchExternalIds(tmdbId, type as "movie" | "tv");
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to fetch from TMDB" }, { status: 502 });
    }

    const json = result.json;
    // external_ids endpoint places imdb id directly on the response as `imdb_id`
    const imdbId = json?.imdb_id ?? (json?.external_ids && json.external_ids.imdb_id) ?? null;
    return NextResponse.json({ imdbId });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
