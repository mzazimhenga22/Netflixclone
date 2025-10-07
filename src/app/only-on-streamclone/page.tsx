
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

const fetchAndHydrate = async (movieList: Movie[]): Promise<Movie[]> => {
    const detailedMovies = await Promise.all(
      movieList.map(movie => getMovieOrTvDetails(movie.id, movie.media_type))
    );
    return detailedMovies.filter((movie): movie is Movie => movie !== null);
};


export default async function OnlyOnNetflixPage() {
    const [
        criticallyAcclaimedDramas,
        internationalTv,
        usTv,
        anime,
        koreanDramas,
        comedies,
        awardWinning,
        bingeworthy
    ] = await Promise.all([
        getMoviesByGenre(18).then(fetchAndHydrate), // Drama
        getTvShowsByGenre(80).then(fetchAndHydrate), // Crime TV as stand-in for international
        getTvShowsByGenre(10764).then(fetchAndHydrate), // Reality TV as stand-in
        getTvShowsByGenre(16).then(fetchAndHydrate), // Animation (Anime)
        getTvShowsByGenre(18, 40).then(res => res.filter(m => m.original_language === 'ko').slice(0,20)).then(fetchAndHydrate), // Korean Dramas
        getMoviesByGenre(35).then(fetchAndHydrate), // Comedy
        getMoviesByGenre(99).then(fetchAndHydrate), // Documentaries as stand-in
        getTvShowsByGenre(10765).then(fetchAndHydrate), // Sci-Fi & Fantasy
    ]);
    
    const categories: MovieCategory[] = [
        { title: "Critically Acclaimed TV Dramas", movies: criticallyAcclaimedDramas },
        { title: "International TV Shows", movies: internationalTv },
        { title: "US TV Shows", movies: usTv },
        { title: "Anime", movies: anime },
        { title: "K-Dramas for Beginners", movies: koreanDramas },
        { title: "Comedies", movies: comedies },
        { title: "Award-Winning Films", movies: awardWinning },
        { title: "Binge-worthy TV Shows", movies: bingeworthy },
    ];

  return (
    <div className="bg-black text-white">
      <LandingHeader />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Only on StreamClone</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-12">
                StreamClone is the home of amazing original programming that you can’t find anywhere else. Movies, TV shows, specials and more, all tailored specifically to you.
            </p>

            <div className="space-y-12">
                {categories.map((category) => (
                    <StaticMovieRow key={category.title} title={category.title} movies={category.movies} />
                ))}
            </div>

            <div className="text-center mt-20 py-12">
                <h2 className="text-3xl font-bold">There’s even more to watch.</h2>
                <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                    StreamClone has an extensive library of feature films, documentaries, TV shows, anime, award-winning originals, and more. Watch as much as you want, anytime you want.
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
