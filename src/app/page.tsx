import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/shared/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import TrendingNow from "@/components/landing/TrendingNow";
import FeatureGrid from "@/components/landing/FeatureGrid";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="bg-black text-white">
      <LandingHeader />
      <main>
        <section className="relative h-[65vh] md:h-[85vh] flex items-center justify-center text-center">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-transparent to-black/80" />
          <div className="relative z-10 px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black max-w-2xl mx-auto">
              Unlimited movies, TV shows, and more
            </h1>
            <p className="text-lg md:text-2xl mt-4">
              Watch anywhere. Cancel anytime.
            </p>
            <form className="max-w-xl mx-auto mt-6">
              <h3 className="text-lg md:text-xl mb-4 px-8">
                Ready to watch? Enter your email to create or restart your membership.
              </h3>
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-grow bg-black/70 border-white/50 h-14 text-lg"
                  name="email"
                />
                <Button asChild type="submit" size="lg" className="h-14 text-2xl font-semibold px-6">
                  <Link href="/signup/registration">
                    Get Started <ChevronRight className="ml-1 h-7 w-7" />
                  </Link>
                </Button>
              </div>
            </form>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent" />
        </section>

        <section className="py-12 md:py-20 border-b-8 border-[#232323] bg-black">
          <TrendingNow />
        </section>

        <section className="py-12 md:py-20 border-b-8 border-[#232323] bg-black">
            <FeatureGrid />
        </section>
        
        <div className="border-b-8 border-[#232323] bg-black">
            <Faq />
        </div>

        <div className="py-12 md:py-16 text-center bg-black">
            <form className="max-w-xl mx-auto px-4">
              <h3 className="text-lg md:text-xl mb-4">
                Ready to watch? Enter your email to create or restart your membership.
              </h3>
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-grow bg-black/70 border-white/50 h-14 text-lg"
                  name="email"
                />
                <Button asChild type="submit" size="lg" className="h-14 text-2xl font-semibold px-6">
                  <Link href="/signup/registration">
                    Get Started <ChevronRight className="ml-1 h-7 w-7" />
                  </Link>
                </Button>
              </div>
            </form>
        </div>
      </main>
      <div className="w-full h-2 bg-[#232323]" />
      <Footer />
    </div>
  );
}
