import { getMoviesByGenre, getTvShowsByGenre, getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/shared/Footer';
import StaticMovieRow from '@/components/landing/StaticMovieRow';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type MovieCategory = {
  title: string;
  movies: Movie[];
};

// --- CONFIG ---
const CONCURRENCY = 3; // how many detail requests at once
const MAX_PER_GENRE = 20; // max items to hydrate per genre
const MAX_RETRIES = 4; // retry attempts for transient errors
const BASE_DELAY_MS = 500; // base delay for backoff

// --- local concurrency limiter (replacement for p-limit) ---
function createLimiter(concurrency: number) {
  let active = 0;
  const queue: (() => void)[] = [];

  return function <T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        active++;
        try {
          const out = await fn();
          resolve(out);
        } catch (err) {
          reject(err);
        } finally {
          active--;
          const next = queue.shift();
          if (next) next();
        }
      };

      if (active < concurrency) run();
      else queue.push(run);
    });
  };
}

const limit = createLimiter(CONCURRENCY);
const detailsCache = new Map<string, Movie | null>();

/**
 * sleep with jitter
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms + Math.random() * 200));

/**
 * Small helper: decide whether an error is a rate-limit / transient network error.
 */
function isTransientError(err: any) {
  if (!err) return false;
  if (err?.status === 429) return true;
  const msg = String(err?.message ?? err).toLowerCase();
  return msg.includes('rate limit') || msg.includes('429') || msg.includes('network') || msg.includes('timeout');
}

/**
 * Retry wrapper with jittered exponential backoff for transient errors.
 */
async function retry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, baseDelay = BASE_DELAY_MS): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0 || !isTransientError(err)) throw err;
    const attempt = MAX_RETRIES - retries + 1;
    const delay = baseDelay * 2 ** (attempt - 1);
    console.warn(`⚠️ TMDB transient error detected. Retry #${attempt} in ${delay}ms...`);
    await sleep(delay);
    return retry(fn, retries - 1, baseDelay);
  }
}

/**
 * Cached detail fetch that uses concurrency limiter + retries.
 * uses explicit media_type ('movie' | 'tv') to avoid incorrect endpoint 404s.
 */
async function cachedGetDetails(id: number, media_type: 'movie' | 'tv'): Promise<Movie | null> {
  const key = `${media_type}-${id}`;
  if (detailsCache.has(key)) return detailsCache.get(key) ?? null;

  // placeholder to prevent duplicate parallel fetches
  detailsCache.set(key, null);

  try {
    const result = await limit(() =>
      retry(() => getMovieOrTvDetails(id, media_type)).catch((err) => {
        // After retries, log as warn and return null so page still renders
        console.warn(`Failed to fetch details for ${key}:`, (err as any)?.message ?? err);
        return null;
      })
    );

    detailsCache.set(key, result);
    return result;
  } catch (err) {
    console.warn(`Unexpected error fetching details for ${key}:`, (err as any)?.message ?? err);
    detailsCache.set(key, null);
    return null;
  }
}

/**
 * Hydrate movie list -> full details with concurrency, caching and safety.
 * Accepts an explicit mediaType to avoid guessing and 404s.
 */
const fetchAndHydrate = async (movieList: Movie[], mediaType: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
  const limited = movieList.slice(0, MAX_PER_GENRE);
  const detailed = await Promise.all(
    limited.map((m) =>
      cachedGetDetails(
        m.id,
        (mediaType as 'movie' | 'tv') ?? ((m as any).media_type ?? (m as any).mediaType ?? 'movie')
      )
    )
  );
  return detailed.filter((m): m is Movie => m !== null);
};

export default async function OnlyOnNetflixPage() {
  // Use Promise.allSettled so one failing fetch doesn't break the whole page.
  const fetches = [
    retry(() => getMoviesByGenre(18)).then((res) => fetchAndHydrate(res, 'movie')), // Drama (movie list)
    retry(() => getTvShowsByGenre(80)).then((res) => fetchAndHydrate(res, 'tv')), // Crime TV
    retry(() => getTvShowsByGenre(10764)).then((res) => fetchAndHydrate(res, 'tv')), // Reality TV
    retry(() => getTvShowsByGenre(16)).then((res) => fetchAndHydrate(res, 'tv')), // Animation (Anime)
    retry(() => getTvShowsByGenre(18, 40))
      .then((res) => res.filter((m) => m.original_language === 'ko').slice(0, MAX_PER_GENRE))
      .then((res) => fetchAndHydrate(res, 'tv')), // Korean Dramas (tv)
    retry(() => getMoviesByGenre(35)).then((res) => fetchAndHydrate(res, 'movie')), // Comedy
    retry(() => getMoviesByGenre(99)).then((res) => fetchAndHydrate(res, 'movie')), // Documentaries as stand-in
    retry(() => getTvShowsByGenre(10765)).then((res) => fetchAndHydrate(res, 'tv')), // Sci-Fi & Fantasy
  ];

  const settled = await Promise.allSettled(fetches);

  // Convert to arrays (if a job failed, fall back to empty array)
  const results = settled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value as Movie[];
    console.warn(`Genre fetch #${i} failed:`, (s as any).reason ?? 'unknown');
    return [] as Movie[];
  });

  // destructure safely even if some entries are empty arrays
  const [
    criticallyAcclaimedDramas,
    internationalTv,
    usTv,
    anime,
    koreanDramas,
    comedies,
    awardWinning,
    bingeworthy,
  ] = results;

  const categories: MovieCategory[] = [
    { title: 'Critically Acclaimed TV Dramas', movies: criticallyAcclaimedDramas },
    { title: 'International TV Shows', movies: internationalTv },
    { title: 'US TV Shows', movies: usTv },
    { title: 'Anime', movies: anime },
    { title: 'K-Dramas for Beginners', movies: koreanDramas },
    { title: 'Comedies', movies: comedies },
    { title: 'Award-Winning Films', movies: awardWinning },
    { title: 'Binge-worthy TV Shows', movies: bingeworthy },
  ];

  return (
    <div className="bg-black text-white">
      <LandingHeader />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Only on StreamClone</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-12">
            StreamClone is the home of amazing original programming that you can’t find anywhere else.
            Movies, TV shows, specials and more, all tailored specifically to you.
          </p>

          <div className="space-y-12">
            {categories.map((category) => (
              <StaticMovieRow key={category.title} title={category.title} movies={category.movies} />
            ))}
          </div>

          <div className="text-center mt-20 py-12">
            <h2 className="text-3xl font-bold">There’s even more to watch.</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
              StreamClone has an extensive library of feature films, documentaries, TV shows, anime,
              award-winning originals, and more. Watch as much as you want, anytime you want.
            </p>
            <Button asChild size="lg" className="h-14 text-xl mt-8">
              <Link href="/signup/registration">Join Now</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
