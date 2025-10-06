
"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/browse/Navbar";
import Footer from "@/components/shared/Footer";
import { useWatchHistory, type WatchHistoryItem } from '@/hooks/useWatchHistory';
import { getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

type HistoryMovie = Movie & { watchedAt: number };

export default function ViewingActivityPage() {
  const { profile } = useProfile();
  const { history, removeWatchHistory } = useWatchHistory();
  const [activity, setActivity] = useState<HistoryMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      if (history.length === 0) {
        setActivity([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const moviePromises = history.map(async (item: WatchHistoryItem) => {
          const details = await getMovieOrTvDetails(item.id, item.media_type);
          if (details) {
            return { ...details, watchedAt: item.watchedAt };
          }
          return null;
        });
        const movies = await Promise.all(moviePromises);
        setActivity(movies.filter((movie): movie is HistoryMovie => movie !== null));
      } catch (error) {
        console.error("Failed to fetch viewing activity details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [history]);
  
  const handleRemove = (id: number) => {
    removeWatchHistory(id);
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">Account</h1>
              <p className="text-muted-foreground">Member since July 2024</p>
            </div>
            <span className="text-sm text-blue-500">My Profile</span>
          </div>
          <hr className="border-gray-600 mb-6" />
          <h2 className="text-2xl font-semibold mb-6">My Viewing Activity</h2>

          {activity.length > 0 ? (
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={`${item.id}-${item.watchedAt}`} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div className="flex items-center">
                     <span className="text-muted-foreground w-28 flex-shrink-0">
                        {new Date(item.watchedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                     </span>
                     <span>{item.title || item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => handleRemove(item.id)}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Hide from history</span>
                    </Button>
                    <a href="#" className="text-blue-500 text-sm hover:underline">Report a problem</a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="flex flex-col items-center justify-center h-[40vh] text-center">
              <h2 className="text-2xl font-semibold">No viewing activity yet</h2>
              <p className="text-muted-foreground mt-2">
                When you watch something, it will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
      <div className="bg-[#111] mt-12">
        <Footer />
      </div>
    </div>
  );
}
