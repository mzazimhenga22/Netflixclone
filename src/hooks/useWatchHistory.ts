
"use client";

import { useMemo } from 'react';
import { useProfile } from './useProfile';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, where, query, limit, getDocs } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Movie } from '@/types';

export type WatchHistoryItem = {
  id: string; // Firestore document ID
  mediaId: number;
  progress: number;
  duration: number;
  media_type: 'movie' | 'tv';
  watchedAt: any;
};

const FINISHED_THRESHOLD = 0.95; // 95% watched

export const useWatchHistory = () => {
  const { user } = useUser();
  const { activeProfile } = useProfile();
  const firestore = useFirestore();

  const historyCollectionRef = useMemoFirebase(() => {
    if (!user || !activeProfile || !firestore) return null;
    return collection(firestore, `users/${user.uid}/profiles/${activeProfile.id}/history`);
  }, [user, activeProfile, firestore]);
  
  const { data: historyItems, isLoading } = useCollection<WatchHistoryItem>(historyCollectionRef);

  const history = useMemo(() => {
    if (!historyItems) return [];
    return historyItems
      .filter(item => (item.progress / item.duration) < FINISHED_THRESHOLD)
      .sort((a, b) => b.watchedAt.toMillis() - a.watchedAt.toMillis());
  }, [historyItems]);

  const updateWatchHistory = async (media: Movie, progress: number, duration: number) => {
    if (!historyCollectionRef || !media.media_type) return;

    const newItemData = {
        mediaId: media.id,
        progress,
        duration,
        media_type: media.media_type,
        watchedAt: serverTimestamp()
    };
    
    // Find if an item already exists for this mediaId
    const q = query(historyCollectionRef, where("mediaId", "==", media.id), limit(1));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Update existing item
            const docToUpdate = querySnapshot.docs[0];
            const docRef = doc(historyCollectionRef, docToUpdate.id);
            setDocumentNonBlocking(docRef, newItemData, { merge: true });
        } else {
            // Add new item (using set with a specific ID to avoid duplicates in quick succession)
            const docRef = doc(historyCollectionRef, `${media.id}`);
            setDocumentNonBlocking(docRef, newItemData, { merge: true });
        }
    } catch (error) {
        console.error("Error updating watch history:", error);
    }
  };

  const removeWatchHistory = (mediaId: number) => {
    if (!historyCollectionRef || !historyItems) return;
    const itemToRemove = historyItems.find(item => item.mediaId === mediaId);
    if (itemToRemove) {
      const docRef = doc(historyCollectionRef, itemToRemove.id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return { history, isLoading, updateWatchHistory, removeWatchHistory };
};
