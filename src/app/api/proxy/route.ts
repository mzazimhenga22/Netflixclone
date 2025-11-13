// app/api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { URL } from "url";
import https from "https";
import nodeFetch, { RequestInit as NodeRequestInit, Response as NodeResponse } from "node-fetch";

// Force Node.js runtime so we can use https.Agent
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// --- Browser-like headers ---
function browserHeaders(): Record<string, string> {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Connection: "keep-alive",
  };
}

// --- CORS helper ---
function cors(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
    "Access-Control-Allow-Headers":
      "Range, Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    ...extra,
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

// --- URL helpers ---
function getBaseUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.href;
  } catch {
    return url;
  }
}
function abs(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

/**
 * rewritePlaylist(text, baseUrl, hB64)
 * - rewrites every URI line into /api/proxy?url=<base64(original)>
 * - preserves the provided hB64 header param by appending `&h=<hB64>` to each proxied segment/URI
 */
function rewritePlaylist(text: string, baseUrl: string, hB64?: string): string {
  const lines = text.split(/\r?\n/);

  // helper to build proxied path with optional h param
  const makeProxyPath = (absolute: string) => {
    const b64 = Buffer.from(absolute).toString("base64");
    const extra = hB64 ? `&h=${encodeURIComponent(hB64)}` : "";
    return `/api/proxy?url=${encodeURIComponent(b64)}${extra}`;
  };

  return lines
    .map((line) => {
      if (!line) return line;

      // Tag lines with quoted URIs (e.g. #EXT-X-KEY:URI="key.key")
      if (line.startsWith("#")) {
        const replaced = line.replace(/URI="([^"]+)"/g, (_, uri) => {
          if (uri.startsWith("/api/proxy")) return `URI="${uri}"`;
          const absolute = abs(baseUrl, uri);
          return `URI="${makeProxyPath(absolute)}"`;
        });
        return replaced;
      }

      // Non-comment lines -> segment URIs or variant playlist URIs
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("/api/proxy")) {
        // ensure we preserve h param if missing
        if (hB64 && !trimmed.includes("&h=")) return `${trimmed}&h=${encodeURIComponent(hB64)}`;
        return line;
      }

      const absolute = abs(baseUrl, trimmed);
      return makeProxyPath(absolute);
    })
    .join("\n");
}

/**
 * Simple fetch wrapper with retries for transient upstream errors/timeouts.
 * - retries default 2 (total attempts = retries+1)
 * - treats network errors and 5xx as retryable
 */
async function fetchWithRetries(url: string, opts: NodeRequestInit, retries = 2, backoff = 250): Promise<NodeResponse> {
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await nodeFetch(url, opts);
      // Retry for 5xx
      if (res.status >= 500 && attempt < retries) {
        lastErr = new Error(`Upstream 5xx: ${res.status}`);
        await new Promise((r) => setTimeout(r, backoff * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoff * (attempt + 1)));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}

// --- Main GET handler ---
export async function GET(req: NextRequest) {
  try {
    const encoded = req.nextUrl.searchParams.get("url");
    if (!encoded)
      return NextResponse.json({ error: "Missing url" }, { status: 400 });

    // optional headers param (base64-encoded JSON)
    const hB64 = req.nextUrl.searchParams.get("h") || undefined;
    let headerOverrides: Record<string, string> | undefined;
    if (hB64) {
      try {
        headerOverrides = JSON.parse(Buffer.from(hB64, "base64").toString("utf8"));
      } catch (e) {
        console.warn("[Proxy] Invalid h param, ignoring headers");
      }
    }

    let target = Buffer.from(encoded, "base64").toString("utf-8");
    // quiet fetch log — only show host (avoid spamming every segment)
    if (process.env.NODE_ENV !== "production") {
      try {
        const u = new URL(target);
        console.debug(`[Proxy] Fetching host=${u.host}${hB64 ? " with header overrides" : ""}`);
      } catch {
        // noop
      }
    }

    // Node HTTPS agent to allow self-signed / mismatched certs in dev
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Build request headers. Overrides from `h` take precedence.
    const defaultHeaders: Record<string, string> = {
      ...browserHeaders(),
    };
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...(headerOverrides || {}),
    };

    let nodeRes: NodeResponse;

    try {
      const opts: NodeRequestInit = {
        headers: {
          ...headers,
          Range: req.headers.get("range") || "",
        },
        redirect: "manual",
        agent,
      };
      // use retrying wrapper
      nodeRes = await fetchWithRetries(target, opts);
    } catch (err: any) {
      // TLS altname mismatch fallback
      if (err && err.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
        console.warn("[Proxy] Invalid TLS cert -> retrying with HTTP");
        target = target.replace(/^https:/, "http:");
        nodeRes = await fetchWithRetries(target, { headers, redirect: "manual", agent });
      } else {
        console.error("[Proxy] Fetch error:", err?.message || err);
        throw err;
      }
    }

    // Handle 301/302: redirect to absolute /api/proxy URL (Next requires absolute URL)
    if (nodeRes.status === 301 || nodeRes.status === 302) {
      const loc = nodeRes.headers.get("location");
      if (loc) {
        // keep h param in redirect so subsequent segment requests carry headers
        const newEncoded = Buffer.from(loc).toString("base64");
        const redirectUrl = `${req.nextUrl.origin}/api/proxy?url=${encodeURIComponent(newEncoded)}${hB64 ? `&h=${encodeURIComponent(hB64)}` : ""}`;
        return NextResponse.redirect(redirectUrl);
      }
    }

    // If forbidden, retry once without referer/origin (some hosts block referer)
    if (nodeRes.status === 403) {
      console.warn("[Proxy] 403 — retrying without Referer/Origin");
      nodeRes = await fetchWithRetries(target, {
        headers: browserHeaders(),
        redirect: "manual",
        agent,
      });
    }

    return await handleNodeResponse(target, nodeRes, hB64);
  } catch (err: any) {
    console.error("[Proxy] Error:", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message || "Proxy failed" },
      { status: 500, headers: cors() }
    );
  }
}

// --- convert node-fetch Response into NextResponse / stream and rewrite playlists ---
// Note: this receives hB64 so we can include same h param on rewritten URIs
async function handleNodeResponse(target: string, nodeRes: NodeResponse, hB64?: string) {
  const contentType = (nodeRes.headers.get("content-type") || "").toLowerCase();
  const status = nodeRes.status;

  // m3u8 playlist -> rewrite URIs (and append h param to each proxied URI)
  if (contentType.includes("mpegurl") || target.endsWith(".m3u8")) {
    const text = await nodeRes.text();
    const rewritten = rewritePlaylist(text, getBaseUrl(target), hB64);
    return new NextResponse(rewritten, {
      status,
      headers: cors({
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
      }),
    });
  }

  // Video chunks, TS, MP4, others -> stream
  if (contentType.startsWith("video/") || target.endsWith(".ts") || target.endsWith(".mp4") || target.endsWith(".m4s") ) {
    const body = nodeRes.body;
    if (!body) throw new Error("No body stream from origin");
    const headers: Record<string, string> = {
      "Content-Type": contentType || "application/octet-stream",
      "Cache-Control": "no-cache",
      "Accept-Ranges": "bytes",
    };
    const range = nodeRes.headers.get("content-range");
    if (range) headers["Content-Range"] = range;

    // mirror other safe headers when available
    const cl = nodeRes.headers.get("content-length");
    if (cl) headers["Content-Length"] = cl;

    return new NextResponse(body as any, {
      status,
      headers: cors(headers),
    });
  }

  // Fallback (text/json/etc.)
  const buffer = await nodeRes.arrayBuffer();
  return new NextResponse(buffer, {
    status,
    headers: cors({
      "Content-Type": contentType || "application/octet-stream",
    }),
  });
}

