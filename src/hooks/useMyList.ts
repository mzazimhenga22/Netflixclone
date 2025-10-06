
"use client";

import { useState, useEffect, useCallback } from 'react';

const MY_LIST_KEY = 'streamclone_my_list';

export const useMyList = () => {
  const [myList, setMyList] = useState<number[]>([]);

  useEffect(() => {
    // This code runs only on the client
    try {
      const storedList = localStorage.getItem(MY_LIST_KEY);
      if (storedList) {
        setMyList(JSON.parse(storedList));
      }
    } catch (error) {
      console.error("Failed to parse My List from localStorage", error);
      localStorage.removeItem(MY_LIST_KEY);
    }
  }, []);

  const saveList = (newList: number[]) => {
    try {
      localStorage.setItem(MY_LIST_KEY, JSON.stringify(newList));
      setMyList(newList);
    } catch (error) {
      console.error("Failed to save My List to localStorage", error);
    }
  };

  const addToMyList = useCallback((id: number) => {
    setMyList(prevList => {
      if (prevList.includes(id)) {
        return prevList; // Already in the list
      }
      const newList = [id, ...prevList];
      saveList(newList);
      return newList;
    });
  }, []);

  const removeFromMyList = useCallback((id: number) => {
    setMyList(prevList => {
      const newList = prevList.filter(itemId => itemId !== id);
      saveList(newList);
      return newList;
    });
  }, []);

  return { myList, addToMyList, removeFromMyList };
};
