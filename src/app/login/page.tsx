"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Footer from "@/components/shared/Footer";
import LandingHeader from "@/components/landing/LandingHeader";

export default function SignInPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    router.push(`/login/password?user=${encodeURIComponent(emailOrPhone)}`);
  };

  return (
    <div className="min-h-[120vh] flex flex-col bg-gradient-to-b from-[#3c0000] via-[#550202] to-[#8b0000] text-white">
      <div className="relative z-20">
        <LandingHeader />
      </div>

      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md mx-6 md:mx-0">
          <div
            className="bg-black/75 backdrop-blur-sm rounded-lg px-8 py-10 shadow-2xl border border-white/10"
            role="region"
            aria-label="Sign in panel"
          >
            <div className="flex justify-center mb-6">
              <Image src="/logo.svg" alt="StreamClone logo" width={120} height={36} priority />
            </div>

            <h1 className="text-3xl font-extrabold mb-2 text-center">Welcome back</h1>
            <p className="text-sm text-gray-300 mb-6 text-center">
              Enter your email or phone number to continue.
            </p>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <Label htmlFor="email" className="sr-only">Email or phone number</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Email or phone number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="h-14 bg-[#222] border-[#333] text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remember-me"
                    checked={remember}
                    onCheckedChange={(val: boolean) => setRemember(val)}
                    className="border-gray-500"
                  />
                  <Label htmlFor="remember-me">Remember me</Label>
                </div>

                <Link href="#" className="text-white/90 hover:underline">Need help?</Link>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg bg-white text-black hover:bg-white/90"
              >
                Next
              </Button>
            </form>

            <div className="mt-6 text-sm text-gray-300 text-center">
              New to StreamClone?{" "}
              <Link href="/signup/registration" className="text-white font-semibold hover:underline">
                Sign up now.
              </Link>
            </div>

            <div className="mt-6 text-xs text-gray-400 leading-relaxed text-center">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
              <Link href="#" className="underline text-gray-200">Learn more</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/80">
        <Footer />
      </div>
    </div>
  );
}
