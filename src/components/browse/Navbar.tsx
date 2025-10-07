
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Gamepad2, ScrollText, LogOut } from 'lucide-react';
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
import { getTrending, getMovieOrTvDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import SearchInput from './SearchInput';
import { useAuth } from '@/firebase';

type Notification = {
  id: number;
  title: string;
  description: string;
  image: string;
  time: string;
  media_type?: 'movie' | 'tv';
};

const Navbar = () => {
  const { user, activeProfile, profiles, logout } = useProfile();
  const auth = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const handleSignOut = () => {
    if (auth) {
        auth.signOut();
    }
    logout();
  }

  useEffect(() => {
    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const trending = await getTrending();
            const randomTrendingItem = trending.length > 0 ? trending[Math.floor(Math.random() * trending.length)] : null;
            
            const generatedNotifications: Notification[] = [];

            if (randomTrendingItem) {
                 const details = await getMovieOrTvDetails(randomTrendingItem.id, randomTrendingItem.media_type);
                 if (details && (details.release_date || details.first_air_date)) {
                     generatedNotifications.push({
                        id: details.id,
                        title: `Coming Soon: ${details.title || details.name}`,
                        description: `Arriving on ${new Date(details.release_date! || details.first_air_date!).toLocaleDateString()}`,
                        image: `https://image.tmdb.org/t/p/w200${details.backdrop_path}`,
                        time: formatDistanceToNow(new Date(details.release_date! || details.first_air_date!), { addSuffix: true }),
                        media_type: details.media_type
                    });
                 }
            }
            
            if (trending.length > 0) {
                const newArrival = trending[0];
                generatedNotifications.push({
                    id: newArrival.id,
                    title: `New Arrival: ${newArrival.title || newArrival.name}`,
                    description: "Just landed in your region. Watch it now!",
                    image: `https://image.tmdb.org/t/p/w200${newArrival.backdrop_path}`,
                    time: "1 day ago",
                    media_type: newArrival.media_type,
                });
            }
            
             if (trending.length > 1) {
                const top10 = trending[1];
                 generatedNotifications.push({
                    id: top10.id,
                    title: `Trending Now`,
                    description: `${top10.title || top10.name} is climbing the charts!`,
                    image: `https://image.tmdb.org/t/p/w200${top10.backdrop_path}`,
                    time: "3 days ago",
                    media_type: top10.media_type,
                });
            }


            setNotifications(generatedNotifications.filter(n => n.image.endsWith('.jpg') || n.image.endsWith('.png')));


        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    fetchNotifications();
  }, []);

  const navItems = [
    { name: 'Home', href: '/browse' },
    { name: 'TV Shows', href: '/tv' },
    { name: 'Movies', href: '/movies' },
    { name: 'New & Popular', href: '#' },
    { name: 'My List', href: '/my-list' }
 ];


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-gradient-to-b from-black/70 to-transparent`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <div className="flex items-center space-x-8">
          <Link href="/browse">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-white/90 hover:text-white/70 transition-colors font-semibold">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="flex-grow" />

        <div className="flex items-center space-x-4">
          <SearchInput />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4 w-80 bg-black/90 border-white/20 text-white" align="end">
              <DropdownMenuLabel className="py-3">Notifications</DropdownMenuLabel>
              {loadingNotifications ? (
                <div className="p-2 space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton className="w-24 h-14 flex-shrink-0" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-2 focus:bg-white/10 cursor-pointer">
                    <div className="flex gap-3 items-start">
                      <div className="w-24 h-14 relative flex-shrink-0">
                        <Image src={notification.image} alt={notification.title} fill className="object-cover rounded-sm"/>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-semibold leading-tight">{notification.title}</p>
                        <p className="text-xs text-white/70 mt-1">{notification.description}</p>
                        <p className="text-xs text-white/50 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="p-4 text-center text-sm text-white/70">
                    No new notifications.
                </DropdownMenuItem>
              )}
               <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem className="justify-center p-2 focus:bg-white/10 cursor-pointer">
                  <span className="text-sm">View All</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-md overflow-hidden focus:outline-none ring-offset-2 ring-offset-background focus:ring-2 focus:ring-ring">
                    {activeProfile ? (
                        <Image src={activeProfile.avatar} alt={activeProfile.name} width={32} height={32} className="rounded-md" />
                    ) : (
                        <Skeleton className="h-8 w-8 rounded-md" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4" align="end">
                {activeProfile && <DropdownMenuLabel>Hi {activeProfile.name}!</DropdownMenuLabel>}
                <DropdownMenuSeparator />
                {profiles.filter(p => p.id !== activeProfile?.id).map(p => (
                    <DropdownMenuItem key={p.id}>
                        <Link href="/profiles/setup" className='flex items-center w-full'>
                            <Image src={p.avatar} width={20} height={20} alt={p.name} className="rounded-sm mr-2" />
                            <span>{p.name}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuItem>
                    <Link href="/profiles/setup" className='flex items-center w-full'>
                       <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                        <span>Manage Profiles</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profiles/transfer" className='flex items-center w-full'>
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    <span>Transfer Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/account" className='flex items-center w-full'>
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <span>Account</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/account/viewing-activity" className='flex items-center w-full'>
                    <ScrollText className="mr-2 h-4 w-4" />
                    <span>Viewing Activity</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out of StreamClone</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
