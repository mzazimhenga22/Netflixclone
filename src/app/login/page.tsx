
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Footer from '@/components/shared/Footer';
import LandingHeader from '@/components/landing/LandingHeader';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    initiateEmailSignIn(auth, email, password);
    // The onAuthStateChanged listener in the provider will handle the redirect
    router.push('/profiles/setup');
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
       <div className="relative flex-grow">
        <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1594954441499-52dbe0b0e513?fit=crop&w=1920&h=1080" alt="background" className="w-full h-full object-cover opacity-40"/>
             <div className="absolute inset-0 bg-black/50" />
        </div>
        <LandingHeader />
        <div className="relative flex justify-center items-center h-full">
            <div className="bg-black/80 p-16 rounded-md w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6">Sign In</h1>
                <form onSubmit={handleSignIn} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email or phone number"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 bg-[#333] border-[#333] text-lg"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 bg-[#333] border-[#333] text-lg"
                    />
                    <Button type="submit" size="lg" className="w-full h-12 text-lg">Sign In</Button>
                     <div className="flex justify-between items-center text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <Checkbox id="remember-me" className="border-gray-500"/>
                            <Label htmlFor="remember-me">Remember me</Label>
                        </div>
                        <Link href="#" className="hover:underline">Need help?</Link>
                    </div>
                </form>
                <div className="mt-8 text-gray-400">
                    New to StreamClone? <Link href="/signup/registration" className="text-white font-semibold hover:underline">Sign up now.</Link>
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
