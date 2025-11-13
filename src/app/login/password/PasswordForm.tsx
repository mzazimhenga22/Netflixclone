"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function PasswordFormContent() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const firebaseAuth = useAuth();

  const user = searchParams.get("user") || "";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !user) {
      toast({ title: "Missing information", description: "Please enter your password." });
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(firebaseAuth, user, password);
      router.push("/profiles/setup");
    } catch (error: any) {
      toast({ title: "Sign-in failed", description: error.message || "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  return (
    <div className="bg-black/75 backdrop-blur-sm rounded-lg px-8 py-10 shadow-2xl border border-white/10" role="region" aria-label="Password panel">
      <div className="flex justify-center mb-6">
        <Image src="/logo.svg" alt="StreamClone logo" width={120} height={36} priority />
      </div>

      <h1 className="text-3xl font-extrabold mb-3 text-center">Welcome back</h1>
      <p className="text-sm text-gray-300 mb-6 text-center">
        Enter your password for <span className="text-white font-semibold">{user}</span>
      </p>

      <form onSubmit={handleSignIn} className="space-y-5">
        <div>
          <Label htmlFor="password" className="sr-only">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 bg-[#222] border-[#333] text-white placeholder:text-gray-400"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-lg bg-white text-black hover:bg-white/90"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <a href="/login" className="text-white/80 hover:underline">
          Go back
        </a>
      </div>
    </div>
  );
}

export function PasswordForm() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <PasswordFormContent />
    </Suspense>
  );
}
