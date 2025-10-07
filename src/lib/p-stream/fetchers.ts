import { Fetcher, FetcherOptions, FetcherResponse } from './types';

function a(val: string | number | boolean): string {
  return String(val);
}

function b(params: Record<string, any>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => p.append(key, a(v)));
      return;
    }
    p.append(key, a(value));
  });
  return p.toString();
}

function c(url: string, params: Record<string, any>): string {
  const u = new URL(url);
  u.search = b(params);
  return u.toString();
}

/**
 * Safe normalization of an incoming `url` parameter which may be:
 * - string
 * - URL
 * - Request-like object with .url
 * - anything with a toString()
 *
 * Avoids `instanceof URL` (which can trigger TS errors in some environments).
 */
function normalizeUrlToString(url: unknown): string {
  if (typeof url === 'string') return url;
  // If it's a URL object, it usually has href or toString; try both safely.
  try {
    const asAny = url as any;
    if (asAny && typeof asAny.href === 'string') return asAny.href;
    if (asAny && typeof asAny.url === 'string') return asAny.url;
    if (asAny && typeof asAny.toString === 'function') return asAny.toString();
  } catch {
    // fallthrough
  }
  return String(url ?? '');
}

export function makeStandardFetcher(f: typeof fetch): Fetcher {
  const standardFetcher: Fetcher = async (url, ops = {} as FetcherOptions) => {
    // normalize url to string (accept string | URL | Request-like)
    const urlStr = normalizeUrlToString(url);

    let u = urlStr;

    // only append query when ops.query is an object (not a string)
    if ((ops.method === 'GET' || !ops.method) && ops.query && typeof ops.query === 'object' && ops.query !== null) {
      u = c(u, ops.query as Record<string, any>);
    }

    let body: any = ops.body;
    if (ops.bodyType === 'json' && ops.body) {
      body = JSON.stringify(ops.body);
    }
    if (ops.bodyType === 'form' && ops.body && typeof ops.body === 'object') {
      body = b(ops.body as Record<string, any>);
    }

    const res = await f(u, {
      method: ops.method,
      headers: ops.headers,
      body,
    });

    const out: FetcherResponse = {
      statusCode: res.status,
      headers: new Headers(),
      finalUrl: (res as any).url ?? u,
      body: '',
    };

    ops.readHeaders?.forEach((v) => {
      const headerVal = res.headers.get(v);
      if (headerVal) out.headers.set(v, headerVal);
    });

    if (ops.responseType === 'json') {
      out.body = await res.json();
    } else {
      out.body = await res.text();
    }

    return out;
  };

  return standardFetcher;
}

export function makeSimpleProxyFetcher(proxyUrl: string, f: typeof fetch): Fetcher {
  const fetcher = makeStandardFetcher(f);
  const proxyFetcher: Fetcher = (url, ops) => {
    // stringify incoming url safely
    const urlStr = normalizeUrlToString(url);
    const proxiedUrl = new URL(proxyUrl);
    // use raw url param (server may expect base64 or plain URL based on implementation)
    proxiedUrl.searchParams.set('url', urlStr);
    return fetcher(proxiedUrl.toString(), ops);
  };
  return proxyFetcher;
}
