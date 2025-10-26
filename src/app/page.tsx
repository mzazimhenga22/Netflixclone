import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/shared/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TrendingNow from "@/components/landing/TrendingNow";
import FeatureGrid from "@/components/landing/FeatureGrid";

export default async function Home() {
  // Netflix Kenya hero background (official)
  const heroImageUrl =
    "https://assets.nflxext.com/ffe/siteui/vlv3/9ba9f0e2-b246-47f4-bd1f-3e84c23a5db8/web/KE-en-20251020-TRIFECTA-perspective_ef601db5-02a6-4475-b1a5-a6723a8b944f_large.jpg";

  return (
    <div className="bg-black text-white">
      <LandingHeader signInUrl="/login" />

      <main>
        {/* HERO SECTION */}
        <section className="relative h-[65vh] md:h-[85vh] flex items-center justify-center text-center overflow-hidden">
          <Image
            src={heroImageUrl}
            alt="Netflix Hero Background"
            fill
            className="object-cover"
            priority
          />

          {/* Dark overlay gradient for text visibility */}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-transparent to-black/80" />

          {/* Hero Text */}
          <div className="relative z-10 px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black max-w-2xl mx-auto">
              Unlimited movies, TV shows, and more
            </h1>
            <p className="text-lg md:text-2xl mt-4">
              Watch anywhere. Cancel anytime.
            </p>

            {/* Email Form */}
            <form className="max-w-xl mx-auto mt-6">
              <h3 className="text-lg md:text-xl mb-4 px-8">
                Ready to watch? Enter your email to create or restart your
                membership.
              </h3>
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-grow bg-black/70 border-white/50 h-14 text-lg"
                  name="email"
                />
                <Button
                  asChild
                  type="submit"
                  size="lg"
                  className="h-14 text-2xl font-semibold px-6"
                >
                  <Link href="/signup/registration">
                    Get Started <ChevronRight className="ml-1 h-7 w-7" />
                  </Link>
                </Button>
              </div>
            </form>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent" />
        </section>

        {/* TRENDING */}
        <section className="py-12 md:py-20 border-b-8 border-[#232323] bg-black">
          <TrendingNow />
        </section>

        {/* FEATURES */}
        <section className="py-12 md:py-20 border-b-8 border-[#232323] bg-black">
          <FeatureGrid />
        </section>

        {/* FAQ */}
        <div className="border-b-8 border-[#232323] bg-black">
          <Faq />
        </div>

        {/* EMAIL FORM (bottom) */}
        <div className="py-12 md:py-16 text-center bg-black">
          <form className="max-w-xl mx-auto px-4">
            <h3 className="text-lg md:text-xl mb-4">
              Ready to watch? Enter your email to create or restart your
              membership.
            </h3>
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                type="email"
                placeholder="Email address"
                className="flex-grow bg-black/70 border-white/50 h-14 text-lg"
                name="email"
              />
              <Button
                asChild
                type="submit"
                size="lg"
                className="h-14 text-2xl font-semibold px-6"
              >
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
