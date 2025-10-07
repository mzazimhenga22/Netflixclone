
import { Fetcher, FetcherOptions, FetcherResponse } from './types';

function a(val: string | number | boolean): string {
  return val.toString();
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

export function makeStandardFetcher(f: typeof fetch): Fetcher {
  const standardFetcher: Fetcher = async (url, ops) => {
    let u = url;
    if (ops.method === 'GET' && ops.query) {
      u = c(u, ops.query);
    }

    let body: any = ops.body;
    if (ops.bodyType === 'json' && ops.body) {
      body = JSON.stringify(ops.body);
    }
    if (ops.bodyType === 'form' && ops.body) {
      body = b(ops.body);
    }

    const res = await f(u, {
      method: ops.method,
      headers: ops.headers,
      body,
    });

    const out: FetcherResponse = {
      statusCode: res.status,
      headers: new Headers(),
      finalUrl: res.url,
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
    const proxiedUrl = new URL(proxyUrl);
    proxiedUrl.searchParams.set('url', url);
    return fetcher(proxiedUrl.toString(), ops);
  };
  return proxyFetcher;
}
