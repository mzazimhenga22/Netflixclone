
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  pin?: string;
  isLocked: boolean;
  favoriteGenreId?: number;
  country: string; // ISO 3166-1 code
};

const ACTIVE_PROFILE_KEY = 'streamclone_active_profile';

export const useProfile = () => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const profilesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/profiles`);
  }, [user, firestore]);

  const { data: profiles, isLoading: areProfilesLoading } = useCollection<Omit<Profile, 'id'>>(profilesCollectionRef);

  // Effect to load active profile from localStorage
  useEffect(() => {
    if (isUserLoading || areProfilesLoading) return;
    try {
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (storedProfileId && profiles) {
        const foundProfile = profiles.find(p => p.id === storedProfileId);
        setActiveProfile(foundProfile || null);
      } else {
        setActiveProfile(null);
      }
    } catch (error) {
      console.error("Failed to parse active profile from localStorage", error);
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      setActiveProfile(null);
    }
  }, [profiles, isUserLoading, areProfilesLoading]);

  // Effect for redirecting if no user or no active profile
  useEffect(() => {
    const isPublicPage = pathname === '/' || pathname.startsWith('/signup') || pathname === '/login' || pathname.startsWith('/only-on-streamclone');
    const isProfileSetupPage = pathname === '/profiles/setup';

    if (isUserLoading || areProfilesLoading) return;

    if (!user && !isPublicPage) {
      router.push('/login');
    } else if (user && !activeProfile && !isProfileSetupPage) {
      router.push('/profiles/setup');
    }
  }, [user, activeProfile, isUserLoading, areProfilesLoading, pathname, router]);


  const setActive = (profile: Profile | null) => {
    if (profile) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
      setActiveProfile(profile);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      setActiveProfile(null);
    }
  };

  const logout = () => {
      // Note: This needs to also sign out from Firebase
      setActive(null);
      router.push('/login');
  }

  return { 
    user,
    isUserLoading,
    profiles: profiles || [], 
    areProfilesLoading,
    activeProfile, 
    setActiveProfile: setActive,
    logout
  };
};
