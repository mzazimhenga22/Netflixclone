
"use client";

import { useMemo } from 'react';
import { useProfile } from './useProfile';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Movie } from '@/types';


type MyListItem = {
    id: string; // Firestore document ID
    mediaId: number;
    media_type: 'movie' | 'tv';
    addedAt: any; // serverTimestamp
};

export const useMyList = () => {
  const { user } = useUser();
  const { activeProfile } = useProfile();
  const firestore = useFirestore();

  const myListCollectionRef = useMemoFirebase(() => {
    if (!user || !activeProfile || !firestore) return null;
    return collection(firestore, `users/${user.uid}/profiles/${activeProfile.id}/myList`);
  }, [user, activeProfile, firestore]);
  
  const { data: myListItems, isLoading } = useCollection<MyListItem>(myListCollectionRef);

  const myList = useMemo(() => myListItems?.map(item => item.mediaId) || [], [myListItems]);

  const addToMyList = (media: Movie) => {
    if (!myListCollectionRef || !media.media_type) return;
    const newItem = {
        mediaId: media.id,
        media_type: media.media_type,
        addedAt: serverTimestamp()
    };
    addDocumentNonBlocking(myListCollectionRef, newItem);
  };

  const removeFromMyList = (mediaId: number) => {
    if (!myListCollectionRef || !myListItems) return;
    const itemToRemove = myListItems.find(item => item.mediaId === mediaId);
    if (itemToRemove) {
        const docRef = doc(myListCollectionRef, itemToRemove.id);
        deleteDocumentNonBlocking(docRef);
    }
  };
  
  const toggleMyList = (media: Movie) => {
    if(myList.includes(media.id)) {
        removeFromMyList(media.id);
    } else {
        addToMyList(media);
    }
  }

  return { myList, isLoading, toggleMyList, addToMyList, removeFromMyList };
};
