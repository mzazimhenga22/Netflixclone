
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Profile = {
  id: number;
  name: string;
  avatar: string;
  pin?: string;
  isLocked: boolean;
  favoriteGenreId?: number;
  country: string; // ISO 3166-1 code
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This code runs only on the client
    let storedProfile: string | null = null;
    try {
      storedProfile = localStorage.getItem('activeProfile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // If there's no profile and we are not on a public page, redirect to setup
        if (pathname !== '/' && !pathname.startsWith('/signup') && pathname !== '/profiles/setup') {
          router.push('/profiles/setup');
        }
      }
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      localStorage.removeItem('activeProfile');
       if (pathname !== '/' && !pathname.startsWith('/signup') && pathname !== '/profiles/setup') {
          router.push('/profiles/setup');
        }
    }
  }, [pathname, router]);

  return { profile };
};
