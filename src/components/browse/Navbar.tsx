
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <Link href="/browse">
            <Logo className="h-6 w-auto" />
          </Link>
          <ul className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <li key={item}>
                <Link href={item === 'TMDB' ? '/tmdb' : '#'} className="text-sm text-white/90 hover:text-white/70 transition-colors font-semibold">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:text-white">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-md overflow-hidden focus:outline-none ring-offset-2 ring-offset-background focus:ring-2 focus:ring-ring">
                    <Image src="https://picsum.photos/seed/avatar/32/32" alt="User Avatar" width={32} height={32} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profiles/setup" className='flex items-center w-full'>
                        <User className="mr-2 h-4 w-4" />
                        <span>Manage Profiles</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                     <Link href="/" className='flex items-center w-full'>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
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
