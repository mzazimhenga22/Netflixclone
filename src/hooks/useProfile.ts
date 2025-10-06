
"use client";

import { useState, useEffect } from 'react';

type Profile = {
  id: number;
  name: string;
  avatar: string;
  pin?: string;
  isLocked: boolean;
  favoriteGenreId?: number;
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // This code runs only on the client
    try {
      const storedProfile = localStorage.getItem('activeProfile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      localStorage.removeItem('activeProfile');
    }
  }, []);

  return { profile };
};
