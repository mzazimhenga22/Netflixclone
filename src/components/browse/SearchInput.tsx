
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

export default function SearchInput() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If we are on the search page, keep the search bar open and sync its value
    const currentPath = window.location.pathname;
    const currentQuery = searchParams.get('q');
    if (currentPath === '/search' && currentQuery) {
        setIsSearchOpen(true);
        setQuery(currentQuery);
    } else {
        setIsSearchOpen(false);
        setQuery('');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);
  
  useEffect(() => {
    // Use a timeout to debounce navigation
    const timeoutId = setTimeout(() => {
      if (query) {
        router.push(`/search?q=${query}`);
      } else if (window.location.pathname === '/search') {
        router.push('/browse');
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [query, router]);

  const handleClear = () => {
    setQuery('');
    setIsSearchOpen(false);
    if (window.location.pathname === '/search') {
      router.push('/browse');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          'flex items-center bg-black border border-transparent transition-all duration-300',
          isSearchOpen ? 'w-64 border-white' : 'w-10 border-transparent'
        )}
      >
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-white"
        >
          <Search className="h-5 w-5" />
        </button>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titles, people, genres"
          className={cn(
            'bg-transparent border-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0 transition-opacity duration-300 h-full py-0',
            isSearchOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'
          )}
        />
        {isSearchOpen && (
            <button onClick={handleClear} className="p-2 text-white">
                <X className="h-5 w-5" />
            </button>
        )}
      </div>
    </div>
  );
}
