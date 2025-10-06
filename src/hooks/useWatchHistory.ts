
"use client";

import { useState, useEffect, useCallback } from 'react';

export type WatchHistoryItem = {
  id: number;
  progress: number;
  duration: number;
  media_type: 'movie' | 'tv';
  watchedAt: number;
};

const WATCH_HISTORY_KEY = 'streamclone_watch_history';

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    // This code runs only on the client
    try {
      const storedHistory = localStorage.getItem(WATCH_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse watch history from localStorage", error);
      localStorage.removeItem(WATCH_HISTORY_KEY);
    }
  }, []);

  const saveHistory = (newHistory: WatchHistoryItem[]) => {
    try {
      // Sort by most recently watched and limit to 20 items
      const sortedAndLimitedHistory = newHistory
        .sort((a, b) => b.watchedAt - a.watchedAt)
        .slice(0, 20);
      
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(sortedAndLimitedHistory));
      setHistory(sortedAndLimitedHistory);
    } catch (error) {
      console.error("Failed to save watch history to localStorage", error);
    }
  };

  const updateWatchHistory = useCallback((id: number, progress: number, duration: number, media_type: 'movie' | 'tv' | undefined) => {
    if (!media_type) return;

    setHistory(prevHistory => {
      const existingItemIndex = prevHistory.findIndex(item => item.id === id);
      let newHistory: WatchHistoryItem[];

      if (existingItemIndex > -1) {
        // Update existing item
        newHistory = [...prevHistory];
        newHistory[existingItemIndex] = { ...newHistory[existingItemIndex], progress, duration, watchedAt: Date.now() };
      } else {
        // Add new item
        const newItem: WatchHistoryItem = { id, progress, duration, media_type, watchedAt: Date.now() };
        newHistory = [newItem, ...prevHistory];
      }
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const removeWatchHistory = useCallback((id: number) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  return { history, setHistory, updateWatchHistory, removeWatchHistory };
};
