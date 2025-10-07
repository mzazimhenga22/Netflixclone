import { Embed, EmbedOutput, Fetcher, RunnerOptions, Source, SourceOutput } from './types';

const providers = new Map<string, Source | Embed>();

export function registerProvider(provider: Source | Embed) {
  if (providers.has(provider.id)) {
    throw new Error(`Provider with id ${provider.id} is already registered`);
  }
  providers.set(provider.id, provider);
}

function runSource(runnerOps: RunnerOptions, source: Source): Promise<SourceOutput> {
  return source.fn(runnerOps);
}

async function runEmbed(runnerOps: RunnerOptions, embed: Embed): Promise<EmbedOutput> {
  return embed.fn(runnerOps);
}

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
    runAll: async (runnerOps: Pick<RunnerOptions, 'media' | 'extra' | 'events'>) => {
      const sourcesToRun = allSources.filter((v) => v.rank >= 0).sort((a, b) => b.rank - a.rank);

      for (const source of sourcesToRun) {
        let output: SourceOutput;
        try {
          output = await runSource(
            {
              ...runnerOps,
              fetcher: ops.fetcher,
              proxiedFetcher: ops.proxiedFetcher,
              target: ops.target,
              consistentIpForRequests: ops.consistentIpForRequests ?? false,
            },
            source,
          );
        } catch (err) {
          if (err instanceof Error) runnerOps.events?.onError?.(err);
          continue;
        }

        const embedToRun = allEmbeds.find((embed) => embed.id === output.embedId);
        if (!embedToRun) {
          runnerOps.events?.onError?.(new Error(`Source ${source.id} returned embedId that is not registered`));
          continue;
        }

        let embedOutput: EmbedOutput;
        try {
          embedOutput = await runEmbed(
            {
              ...runnerOps,
              fetcher: ops.fetcher,
              proxiedFetcher: ops.proxiedFetcher,
              target: ops.target,
              url: output.url,
              consistentIpForRequests: ops.consistentIpForRequests ?? false,
            },
            embedToRun,
          );
        } catch (err) {
          if (err instanceof Error) runnerOps.events?.onError?.(err);
          continue;
        }

        return {
          sourceId: source.id,
          embedId: embedToRun.id,
          stream: embedOutput.stream,
        };
      }

      return null;
    },
  };
}
