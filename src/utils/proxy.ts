// src/utils/proxy.ts
export type HeaderMap = Record<string, string | undefined>;

function normalizeEnvBase(env: string) {
  let v = env.trim();
  // If it already contains an explicit "url=" param, assume it's finished
  if (v.includes("url=")) {
    // ensure it ends with url=<maybe-value-or-empty> so callers can append
    if (!v.endsWith("=")) return v + "=";
    return v;
  }

  // If it already ends with '?' or '&' append url=
  if (v.endsWith("?") || v.endsWith("&")) return v + "url=";

  // If it contains a query already, append &url=
  if (v.includes("?")) return v + "&url=";

  // If path ends with a slash, assume they want /api/proxy?url= on that host
  if (v.endsWith("/")) return v.replace(/\/+$/, "") + "/api/proxy?url=";

  // If they pointed directly to a worker root (like https://worker.example),
  // attach ?url=
  return v + "/api/proxy?url=";
}

function getProxyBase(): string {
  const env = process.env.MOVIE_WEB_PROXY_URL || process.env.MOVIE_WEB_PROXY || "";
  if (env && env.trim() !== "") {
    return normalizeEnvBase(env);
  }
  // default local relative API route for development
  return "/api/proxy?url=";
}

/**
 * Create a proxied M3U8 URL that optionally encodes headers.
 */
export function createM3U8ProxyUrl(targetUrl: string, headers?: HeaderMap) {
  const b64Url = Buffer.from(targetUrl, "utf8").toString("base64");
  const hdrJson = headers && Object.keys(headers).length ? JSON.stringify(headers) : "";
  const b64Hdr = hdrJson ? Buffer.from(hdrJson, "utf8").toString("base64") : "";
  const qUrl = encodeURIComponent(b64Url);
  const qHdr = b64Hdr ? `&hdr=${encodeURIComponent(b64Hdr)}` : "";

  const proxyBase = getProxyBase(); // guaranteed to end with url=
  // proxyBase already contains the trailing url= so append encoded base64
  return `${proxyBase}${qUrl}${qHdr}`;
}

export function setupProxyForFileStream(stream: any, headers?: HeaderMap) {
  if (!stream || typeof stream !== "object") return stream;
  const newStream: any = { ...stream };

  if (newStream.qualities && typeof newStream.qualities === "object") {
    for (const q of Object.keys(newStream.qualities)) {
      const qObj = newStream.qualities[q];
      if (qObj && typeof qObj === "object" && qObj.url) {
        try {
          qObj.url = createM3U8ProxyUrl(qObj.url, headers);
        } catch {
          // leave as-is on error
        }
      }
    }
  } else if (newStream.url && typeof newStream.url === "string") {
    try {
      newStream.url = createM3U8ProxyUrl(newStream.url, headers);
    } catch {
      // leave as-is on error
    }
  }

  newStream.headers = { ...(newStream.headers || {}), ...(headers || {}) };

  return newStream;
}

export default createM3U8ProxyUrl;
