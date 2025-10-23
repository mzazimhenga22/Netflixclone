// src/utils/playlist.ts
import { HeaderMap } from "./proxy";

/**
 * A proxiedFetcher may be provided by your providers. It can return:
 *  - string (text body)
 *  - Response (fetch Response)
 *  - ArrayBuffer / Uint8Array / ArrayBufferView (binary)
 *  - or undefined (meaning not available)
 */
type ProxiedFetcher = (
  url: string,
  opts?: any
) => Promise<string | Response | ArrayBuffer | Uint8Array | ArrayBufferView | undefined>;

/** Convert various ArrayBuffer/ArrayBufferView-like inputs into a concrete Uint8Array */
function toUint8Array(input: ArrayBuffer | ArrayBufferView | string): Uint8Array {
  if (typeof input === "string") {
    return new TextEncoder().encode(input);
  }

  if (ArrayBuffer.isView(input)) {
    const view = input as ArrayBufferView;
    const byteOffset = (view as any).byteOffset ?? 0;
    const byteLength = (view as any).byteLength ?? (view as any).buffer?.byteLength ?? 0;
    return new Uint8Array((view as any).buffer, byteOffset, byteLength);
  }

  // plain ArrayBuffer
  return new Uint8Array(input as ArrayBuffer);
}

/**
 * Fetch helper (server side). Uses fetch; you can replace with Playwright fetch if needed.
 */
async function fetchTextWithHeaders(url: string, headers?: HeaderMap) {
  const h: Record<string, string> = {};
  if (headers) {
    for (const key in headers) {
      const value = headers[key];
      if (value !== undefined) {
        h[key] = value;
      }
    }
  }
  // some hosts are strict about UA
  h["User-Agent"] = h["User-Agent"] ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
  const res = await fetch(url, { headers: h, redirect: "follow" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchArrayBufferWithHeaders(url: string, headers?: HeaderMap) {
  const h: Record<string, string> = {};
  if (headers) {
    for (const key in headers) {
      const value = headers[key];
      if (value !== undefined) {
        h[key] = value;
      }
    }
  }
  h["User-Agent"] = h["User-Agent"] ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
  const res = await fetch(url, { headers: h, redirect: "follow" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  return res.arrayBuffer();
}

/**
 * Convert playlist and its variant playlists + segments into a single master data URL.
 * Returns something like: data:application/vnd.apple.mpegurl;base64,<base64-of-master-m3u8>
 *
 * NOTE: segments are embedded as data:application/octet-stream;base64,<segment>.
 * Use only when segment sizes and playlist are reasonable.
 */
export async function convertPlaylistsToDataUrls(
  proxiedFetcher: ProxiedFetcher | undefined,
  playlistUrl: string,
  headers?: HeaderMap
) {
  if (!playlistUrl) throw new Error("playlistUrl is required");

  // helper to get playlist text (proxiedFetcher or fetch)
  const getText = async (url: string) => {
    if (proxiedFetcher) {
      const maybe = (await proxiedFetcher(url, { method: "GET", headers })) as any;

      if (typeof maybe === "string") return maybe;
      if (maybe && typeof maybe.text === "function") return maybe.text();
      // If it's a Response-like object that has arrayBuffer(), decode that
      if (maybe && typeof maybe.arrayBuffer === "function") {
        const ab = await maybe.arrayBuffer();
        return new TextDecoder().decode(toUint8Array(ab));
      }
      // ArrayBuffer
      if (maybe instanceof ArrayBuffer) return new TextDecoder().decode(toUint8Array(maybe));
      // ArrayBufferView (Uint8Array, DataView, etc.)
      if (ArrayBuffer.isView(maybe)) return new TextDecoder().decode(toUint8Array(maybe as ArrayBufferView));
      throw new Error("proxiedFetcher returned unexpected value (expected string/Response/ArrayBuffer)");
    } else {
      return fetchTextWithHeaders(url, headers);
    }
  };

  const masterText = await getText(playlistUrl);

  // find every non-comment line that looks like a URI
  const variantUris: string[] = [];
  for (const m of masterText.matchAll(/^(?!#)(\S+)/gm)) {
    if (m && m[1]) variantUris.push(m[1]);
  }

  // Map from original absolute URI -> converted playlist text or data-embedded playlist
  const variantMap = new Map<string, string>();

  const absolute = async (base: string, ref: string) => new URL(ref, base).href;

  // For each variant, fetch variant playlist and embed segments
  for (const v of variantUris) {
    const absVariant = await absolute(playlistUrl, v);
    try {
      const varText = await getText(absVariant);
      // replace each segment URI in varText with direct data URI (base64)
      const segLines = varText.split(/\r?\n/);
      for (let i = 0; i < segLines.length; i++) {
        const line = segLines[i].trim();
        if (!line || line.startsWith("#")) continue;
        // make absolute and fetch binary
        const segAbs = await absolute(absVariant, line);

        // fetch binary (use proxiedFetcher if provided and try to get ArrayBuffer/Uint8Array)
        let segBufLike: ArrayBuffer | ArrayBufferView | Uint8Array;
        if (proxiedFetcher) {
          const maybe = await proxiedFetcher(segAbs, { method: "GET", headers, responseType: "arraybuffer" });
          if (maybe instanceof ArrayBuffer) segBufLike = maybe;
          else if (maybe instanceof Response) segBufLike = await maybe.arrayBuffer();
          else if (ArrayBuffer.isView(maybe)) segBufLike = maybe as ArrayBufferView;
          else if (typeof maybe === "string") {
            segBufLike = toUint8Array(maybe);
          } else {
            throw new Error("proxiedFetcher returned unexpected segment body type");
          }
        } else {
          segBufLike = await fetchArrayBufferWithHeaders(segAbs, headers);
        }

        // Normalize to Uint8Array for Buffer.from / btoa in a type-safe way
        const uint8 = toUint8Array(segBufLike as any);

        // Convert to base64 in a runtime-safe way
        const b64 =
          typeof (globalThis as any).Buffer !== "undefined"
            ? (globalThis as any).Buffer.from(uint8).toString("base64")
            : btoa(
                Array.prototype.map
                  .call(uint8, (ch: number) => String.fromCharCode(ch))
                  .join("")
              );

        segLines[i] = `data:application/octet-stream;base64,${b64}`;
      }
      const embeddedVariant = segLines.join("\n");
      variantMap.set(absVariant, embeddedVariant);
    } catch (err) {
      // if variant fetch fails, rethrow for caller to handle
      throw new Error(`Failed to fetch variant ${absVariant}: ${String(err)}`);
    }
  }

  // Now rewrite master playlist: where a URI pointed to a variant, replace with the embedded variant
  const finalMaster = masterText.replace(/^(?!#)(\S+)/gm, (m: string) => {
    try {
      const abs = new URL(m, playlistUrl).href;
      const embedded = variantMap.get(abs);
      if (!embedded) return m;
      const b64 =
        typeof (globalThis as any).Buffer !== "undefined"
          ? (globalThis as any).Buffer.from(embedded, "utf8").toString("base64")
          : btoa(unescape(encodeURIComponent(embedded)));
      return `data:application/vnd.apple.mpegurl;base64,${b64}`;
    } catch {
      return m;
    }
  });

  // Return a master data URL
  const masterB64 =
    typeof (globalThis as any).Buffer !== "undefined"
      ? (globalThis as any).Buffer.from(finalMaster, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(finalMaster)));
  return `data:application/vnd.apple.mpegurl;base64,${masterB64}`;
}
