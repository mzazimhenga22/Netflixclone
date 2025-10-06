
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, Gamepad2, ScrollText } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '../ui/skeleton';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = ['Home', 'TV Shows', 'Movies', 'New & Popular', 'My List'];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <div className="flex items-center space-x-8">
          <Link href="/browse">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-4">
              {navItems.map((item) => (
                <li key={item}>
                  <Link href={'#'} className="text-sm text-white/90 hover:text-white/70 transition-colors font-semibold">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="flex-grow" />

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:text-white">
            <Search className="h-5 w-5" />
          </Button>
          <span className="hidden lg:block text-sm">Kids</span>
          <Button variant="ghost" size="icon" className="text-white hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-md overflow-hidden focus:outline-none ring-offset-2 ring-offset-background focus:ring-2 focus:ring-ring">
                    {profile ? (
                        <Image src={profile.avatar} alt={profile.name} width={32} height={32} className="rounded-md" />
                    ) : (
                        <Skeleton className="h-8 w-8 rounded-md" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4" align="end">
                {profile && <DropdownMenuLabel>Hi {profile.name}!</DropdownMenuLabel>}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profiles/setup" className='flex items-center w-full'>
                        <Image src="https://picsum.photos/seed/avatar2/20/20" width={20} height={20} alt="Jane" className="rounded-sm mr-2" />
                        <span>Jane</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem>
                    <Link href="/profiles/setup" className='flex items-center w-full'>
                        <Image src="https://picsum.photos/seed/avatar3/20/20" width={20} height={20} alt="Kids" className="rounded-sm mr-2" />
                        <span>Kids</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/profiles/setup" className='flex items-center w-full'>
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5l-6 4.5z"/></svg>
                        <span>Manage Profiles</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  <span>Transfer Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ScrollText className="mr-2 h-4 w-4" />
                  <span>Viewing Activity</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                     <Link href="/" className='flex items-center w-full'>
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5l-5-5l-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                        <span>Sign out of StreamClone</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
