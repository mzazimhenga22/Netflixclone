"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SignupHeader from '@/components/shared/SignupHeader';
import Footer from '@/components/shared/Footer';
import { useAuth, initiateEmailSignUp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';


function RegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');


  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ title: "Authentication service not available.", variant: "destructive" });
        return;
    }
    initiateEmailSignUp(auth, email, password);
    // The onAuthStateChanged listener in the provider will handle the redirect.
    // For now, we manually redirect to the next step.
    router.push('/signup/planform');
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SignupHeader />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <div className="text-left">
            <p className="text-xs">STEP 1 OF 3</p>
            <h1 className="text-3xl font-bold mt-2">
              Create a password to start your membership
            </h1>
            <p className="mt-4 text-lg">
              Just a few more steps and you're done!
              <br />
              We hate paperwork, too.
            </p>
          </div>
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Add a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-lg bg-gray-800 border-gray-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="offers" className="border-gray-500"/>
              <Label htmlFor="offers" className="text-gray-400">
                Please do not email me StreamClone special offers.
              </Label>
            </div>
            <Button type="submit" size="lg" className="w-full h-14 text-2xl mt-6">
              Next
            </Button>
          </form>
        </div>
      </main>
      <div className="bg-[#111] mt-12">
        <Footer />
      </div>
    </div>
  );
}

export default function RegistrationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegistrationForm />
        </Suspense>
    )
}
