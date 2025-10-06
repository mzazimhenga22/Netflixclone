import Banner from "@/components/browse/Banner";
import Navbar from "@/components/browse/Navbar";
import MovieRow from "@/components/browse/MovieRow";
import Footer from "@/components/shared/Footer";
import { movieCategories } from "@/lib/data";

export default function BrowsePage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="overflow-hidden">
        <Banner />
        <div className="relative -mt-8 md:-mt-36 pb-16">
          <div className="space-y-8 lg:space-y-12">
            {movieCategories.map((category) => (
              <MovieRow key={category.title} title={category.title} movies={category.movies} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
