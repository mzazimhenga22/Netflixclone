
import { Embed, EmbedRunnerOptions, Fetcher, RunnerOptions, Source, SourceRunnerOptions } from './types';

export function makeProviders(ops: {
  fetcher: Fetcher;
  proxiedFetcher?: Fetcher;
  target: string;
  sources?: Source[];
  embeds?: Embed[];
  consistentIpForRequests?: boolean;
}) {
  const allSources = ops.sources ?? [];
  const allEmbeds = ops.embeds ?? [];

  return {
    runAll: async (runnerOps: Pick<RunnerOptions, 'media' | 'events'>) => {
      const sourcesToRun = allSources.filter((v) => !v.disabled).sort((a, b) => b.rank - a.rank);

      for (const source of sourcesToRun) {
        let output;
        try {
          output = await source.fn({
            ...runnerOps,
            fetcher: ops.fetcher,
            proxiedFetcher: ops.proxiedFetcher ?? ops.fetcher,
            target: ops.target,
            consistentIpForRequests: ops.consistentIpForRequests ?? false,
          } as SourceRunnerOptions);
        } catch (err) {
          if (err instanceof Error) runnerOps.events?.onError?.(err);
          continue;
        }

        if (output.stream) {
           return {
                sourceId: source.id,
                embedId: null, 
                stream: output.stream
            }
        }

        for (const embed of output.embeds) {
            const embedToRun = allEmbeds.find((e) => e.id === embed.embedId);
            if (!embedToRun) {
                 runnerOps.events?.onError?.(new Error(`Source ${source.id} returned embedId that is not registered`));
                 continue;
            }

            let embedOutput;
            try {
                embedOutput = await embedToRun.fn({
                    ...runnerOps,
                    fetcher: ops.fetcher,
                    proxiedFetcher: ops.proxiedFetcher ?? ops.fetcher,
                    target: ops.target,
                    url: embed.url,
                    consistentIpForRequests: ops.consistentIpForRequests ?? false,
                } as EmbedRunnerOptions);
            } catch (err) {
                 if (err instanceof Error) runnerOps.events?.onError?.(err);
                 continue;
            }

            if (embedOutput.stream) {
                 return {
                    sourceId: source.id,
                    embedId: embedToRun.id,
                    stream: embedOutput.stream,
                };
            }
        }
      }

      return null;
    },
  };
}
