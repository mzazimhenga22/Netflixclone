export type ScrapeMedia =
  | {
      type: 'movie';
      title: string;
      releaseYear: number;
      tmdbId: string;
    }
  | {
      type: 'tv';
      title: string;
      releaseYear: number;
      tmdbId: string;
      season: {
        number: number;
        tmdbId: string;
      };
      episode: {
        number: number;
        tmdbId: string;
      };
    };

export type FetcherOptions = {
  method: 'GET' | 'POST';
  url: string;
  body?: Record<string, any> | string;
  bodyType?: 'form' | 'json';
  responseType?: 'json' | 'text';
  headers?: Record<string, string>;
  query?: Record<string, any>;
  readHeaders?: string[];
};

export type FetcherResponse = {
  body: any;
  finalUrl: string;
  statusCode: number;
  headers: Headers;
};

export type Fetcher = (url: string, ops: FetcherOptions) => Promise<FetcherResponse>;

export type RunnerOptions = {
  fetcher: Fetcher;
  proxiedFetcher?: Fetcher;
  media: ScrapeMedia;
  target: string;
  url?: string;
  consistentIpForRequests: boolean;
  extra?: Record<string, any>;
  events?: {
    onError?: (error: Error) => void;
  };
};

type StreamCaption = {
  id: string;
  url: string;
  langIso: string;
  type: 'srt' | 'vtt';
};

export type Stream = {
  qualities: {
    [key: string]: {
      type: 'mp4' | 'hls';
      url: string;
    };
  };
  captions: StreamCaption[];
  headers?: Record<string, string>;
};

export type SourceOutput = {
  embedId: string;
  url: string;
};

export type EmbedOutput = {
  stream: Stream;
};

export type Source = {
  id: string;
  name: string;
  rank: number;
  disabled?: boolean;
  fn: (ops: RunnerOptions) => Promise<SourceOutput>;
};

export type Embed = {
  id: string;
  name: string;
  disabled?: boolean;
  fn: (ops: Runner-Options) => Promise<EmbedOutput>;
};
