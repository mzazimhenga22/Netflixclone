"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
                <Link href="#" className="text-sm text-white/90 hover:text-white/70 transition-colors font-semibold">
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
          <Link href="#">
             <div className="h-8 w-8 rounded-md overflow-hidden">
                <Image src="https://picsum.photos/seed/avatar/32/32" alt="User Avatar" width={32} height={32} />
             </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
