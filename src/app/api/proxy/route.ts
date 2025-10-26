// app/api/proxy/route.ts (Next.js route)
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function addBrowserHeaders(): HeadersInit {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "identity",
    Connection: "keep-alive",
    Referer: "https://google.com",
    Origin: "https://google.com",
  };
}

function toAbsoluteUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function rewritePlaylist(content: string, baseUrl: string): string {
  // Split safely, handle tags with URI="..."
  const lines = content.split(/\r?\n/);
  return lines
    .map((line) => {
      if (!line) return line;

      // For tag lines, replace any URI="...":
      if (line.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (m, uri) => {
          // If already proxied or absolute http(s), leave it
          if (uri.startsWith("/api/proxy") || uri.startsWith("http")) return `URI="${uri}"`;
          const abs = toAbsoluteUrl(baseUrl, uri);
          const encoded = Buffer.from(abs).toString("base64");
          return `URI="/api/proxy?url=${encoded}"`;
        });
      }

      // For URI lines (media playlists, variant playlists, segments, etc.)
      const uri = line.trim();
      if (uri.startsWith("/api/proxy") || uri.startsWith("http")) return line;
      const abs = toAbsoluteUrl(baseUrl, uri);
      const encoded = Buffer.from(abs).toString("base64");
      return `/api/proxy?url=${encoded}`;
    })
    .join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const encodedUrl = req.nextUrl.searchParams.get("url");
    if (!encodedUrl)
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });

    // decodeURIComponent because client now uses encodeURIComponent(btoa(...))
    const decodedParam = decodeURIComponent(encodedUrl);
    const targetUrl = Buffer.from(decodedParam, "base64").toString("utf-8");

    const res = await fetch(targetUrl, {
      headers: addBrowserHeaders(),
      redirect: "follow",
    });

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const status = res.status;

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed (${status})`, url: targetUrl },
        { status }
      );
    }

    // Handle M3U8 playlist modification (support common mpegurl content types)
    if (
      contentType.includes("mpegurl") ||
      targetUrl.toLowerCase().endsWith(".m3u8")
    ) {
      const text = await res.text();
      const rewritten = rewritePlaylist(text, targetUrl);
      // Try to preserve the original content-type if available, otherwise use a safe default
      const ct = res.headers.get("content-type") || "application/vnd.apple.mpegurl";
      return new NextResponse(rewritten, {
        status,
        headers: {
          "Content-Type": ct,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Handle video segments (.ts, .mp4, etc.)
    if (
      contentType.startsWith("video/") ||
      targetUrl.endsWith(".ts") ||
      targetUrl.endsWith(".mp4")
    ) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Fallback: passthrough everything else (images, json, etc.)
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Proxy failed" },
      { status: 500 }
    );
  }
}
