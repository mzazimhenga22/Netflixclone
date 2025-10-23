import { NextResponse, type NextRequest } from "next/server";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

/**
 * Smart Proxy with Puppeteer fallback
 * - Client calls: /api/proxy?url=<base64>
 * - Server first tries Netlify simple-proxy
 * - If blocked by Cloudflare or HTML error, falls back to headless browser fetch
 *
 * Env vars:
 *   NETLIFY_PROXY_BASE=https://your-netlify-proxy.netlify.app
 *   DEBUG_BYPASS_NETLIFY=1  (optional: bypass Netlify)
 *   ENABLE_BROWSER_FALLBACK=1  (enable Puppeteer/Playwright fallback)
 */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Range, Accept, Referer, User-Agent",
  };
}

export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const urlParam = new URL(req.url).searchParams.get("url");
    if (!urlParam) {
      return NextResponse.json({ error: "missing url" }, { status: 400, headers: corsHeaders() });
    }

    const proxyBase =
      process.env.NETLIFY_PROXY_BASE ||
      process.env.NEXT_PUBLIC_PROXY_BASE ||
      "https://gleeful-puppy-593e0e.netlify.app";

    const incoming = req.headers;
    const forward: Record<string, string> = {};
    ["range", "referer", "user-agent", "accept", "accept-language", "cookie"].forEach((h) => {
      const v = incoming.get(h);
      if (v) forward[h] = v;
    });

    const netlifyUrl = `${proxyBase.replace(/\/$/, "")}/?url=${encodeURIComponent(urlParam)}`;
    let upstream: Response;
    let decodedUrl: string | null = null;

    if (process.env.DEBUG_BYPASS_NETLIFY === "1") {
      decodedUrl = Buffer.from(decodeURIComponent(urlParam), "base64").toString("utf8");
      console.log("[/api/proxy DEBUG] Direct fetch:", decodedUrl);
      upstream = await fetch(decodedUrl, { headers: forward, redirect: "follow" });
    } else {
      upstream = await fetch(netlifyUrl, { headers: forward, redirect: "follow" });
    }

    const upstreamStatus = upstream.status;
    const ctype = (upstream.headers.get("content-type") || "").toLowerCase();

    // Handle likely block (HTML)
    if (upstreamStatus !== 200 || ctype.includes("text/html")) {
      const bodyText = await upstream.text().catch(() => "");
      if (process.env.ENABLE_BROWSER_FALLBACK === "1") {
        const target = decodedUrl
          ? decodedUrl
          : Buffer.from(decodeURIComponent(urlParam), "base64").toString("utf8");
        console.warn("[/api/proxy] Cloudflare detected — using Puppeteer fallback for:", target);

        const html = await fetchViaPuppeteer(target);
        if (!html) {
          return NextResponse.json(
            { error: "Puppeteer fallback failed", snippet: bodyText.slice(0, 300) },
            { status: 502, headers: corsHeaders() }
          );
        }

        const resHeaders = new Headers();
        resHeaders.set("Content-Type", "text/html; charset=utf-8");
        resHeaders.set("Access-Control-Allow-Origin", "*");
        resHeaders.set("Access-Control-Allow-Headers", "Content-Type, Range, Accept, Referer, User-Agent");
        return new NextResponse(html, { status: 200, headers: resHeaders });
      }

      console.warn("[/api/proxy] Upstream returned HTML/block page:", bodyText.slice(0, 200));
      return NextResponse.json(
        { error: "upstream returned HTML (likely Cloudflare block)", status: upstreamStatus, snippet: bodyText },
        { status: 502, headers: corsHeaders() }
      );
    }

    // Handle m3u8 playlist
    if (
      ctype.includes("mpegurl") ||
      ctype.includes("vnd.apple.mpegurl") ||
      ctype.includes("application/x-mpegurl")
    ) {
      let playlistText = await upstream.text();
      const localProxyPrefix = process.env.NEXT_PUBLIC_PROXY_BASE
        ? `${process.env.NEXT_PUBLIC_PROXY_BASE.replace(/\/$/, "")}/?url=`
        : "/api/proxy?url=";

      playlistText = playlistText.replace(/https?:\/\/[^\r\n\s]+/g, (match) => {
        try {
          const b64 = encodeURIComponent(Buffer.from(match, "utf8").toString("base64"));
          return `${localProxyPrefix}${b64}`;
        } catch {
          return match;
        }
      });

      const resHeaders = new Headers();
      resHeaders.set("Content-Type", "application/vnd.apple.mpegurl");
      resHeaders.set("Access-Control-Allow-Origin", "*");
      resHeaders.set("Access-Control-Allow-Headers", "Content-Type, Range, Accept, Referer, User-Agent");
      return new NextResponse(playlistText, { status: 200, headers: resHeaders });
    }

    // Stream other media (segments)
    const resHeaders = new Headers(upstream.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Headers", "Content-Type, Range, Accept, Referer, User-Agent");
    return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
  } catch (err: any) {
    console.error("[/api/proxy] error:", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500, headers: corsHeaders() });
  }
}

/**
 * Puppeteer fallback: bypass Cloudflare and JS-based blocking
 */
async function fetchViaPuppeteer(targetUrl: string): Promise<string | null> {
  try {
    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch({
      headless: true, // ✅ use boolean instead of "new"
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });
    const content = await page.content();
    await browser.close();
    return content;
  } catch (err) {
    console.error("[puppeteer fallback] failed:", err);
    return null;
  }
}
