
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SignupHeader from '@/components/shared/SignupHeader';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { useMyList } from '@/hooks/useMyList';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export const PROFILE_TRANSFER_KEY = 'streamclone_profile_transfer_data';

export default function TransferProfilePage() {
    const { profiles, areProfilesLoading } = useProfile();
    const { myList } = useMyList();
    const { history } = useWatchHistory();
    const router = useRouter();
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [isTransferring, setIsTransferring] = useState(false);

    const handleTransfer = () => {
        if (!selectedProfile) return;

        setIsTransferring(true);

        const transferData = {
            profile: selectedProfile,
            myList: myList.map(id => ({ mediaId: id, media_type: 'movie' })), // Assuming movie for simplicity
            history: history.map(item => ({ ...item, watchedAt: item.watchedAt.toMillis() })), // Convert timestamps
        };

        // Simulate a network delay then store in localStorage and redirect
        setTimeout(() => {
            try {
                localStorage.setItem(PROFILE_TRANSFER_KEY, JSON.stringify(transferData));
                // Redirect to start the new account creation process
                router.push('/signup/registration');
            } catch (error) {
                console.error("Could not save transfer data to localStorage", error);
                setIsTransferring(false);
            }
        }, 1500);
    };

    if (areProfilesLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <LoadingSpinner />
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SignupHeader />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-lg text-center px-8">
            {isTransferring ? (
                <div>
                    <h1 className="text-3xl font-bold mt-2">Starting your new membership...</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your profile is being transferred. Redirecting you to create your new account.
                    </p>
                    <LoadingSpinner className="mt-8" />
                </div>
            ) : (
                <>
                    <div className="relative mx-auto w-48 h-32 mb-8 flex items-center justify-center">
                        {profiles.slice(0, 3).map((p, i) => (
                            <div
                                key={p.id}
                                className={cn(
                                    "absolute transition-all duration-300 rounded-full border-4",
                                    selectedProfile?.id === p.id ? 'border-primary scale-110 z-10' : 'border-transparent',
                                    profiles.length === 1 && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                    profiles.length === 2 && i === 0 && 'top-1/2 left-8 -translate-y-1/2',
                                    profiles.length === 2 && i === 1 && 'top-1/2 right-8 -translate-y-1/2',
                                    profiles.length > 2 && i === 0 && 'top-0 left-0',
                                    profiles.length > 2 && i === 1 && 'bottom-0 right-0',
                                    profiles.length > 2 && i === 2 && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-125'
                                )}
                            >
                                <Image
                                    src={p.avatar}
                                    alt={p.name}
                                    width={100}
                                    height={100}
                                    className={cn("rounded-full cursor-pointer hover:opacity-80", selectedProfile?.id === p.id && "ring-2 ring-primary")}
                                    onClick={() => setSelectedProfile(p)}
                                />
                            </div>
                        ))}
                    </div>

                    <h1 className="text-3xl font-bold mt-2">Transfer a profile to a new account.</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {profiles.length > 0 ? "Select a profile below to move to a new StreamClone membership." : "You have no profiles to transfer."}
                    </p>

                    {selectedProfile && (
                        <div className="mt-4 text-accent bg-black/30 p-3 rounded-md">
                           You've selected <span className="font-bold text-white">{selectedProfile.name}</span> for transfer.
                        </div>
                    )}

                    <div className="text-left mt-8 space-y-4 max-w-md mx-auto">
                        <div className="flex items-start gap-4">
                            <Check className="text-primary h-6 w-6 mt-1 flex-shrink-0" />
                            <p>
                                <span className="font-semibold">Your recommendations,</span> viewing history, My List, and other settings will move with you.
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <Check className="text-primary h-6 w-6 mt-1 flex-shrink-0" />
                            <p>
                                You can <span className="font-semibold">keep a copy</span> of the profile on this account.
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleTransfer} disabled={!selectedProfile} size="lg" className="w-full max-w-sm h-14 text-2xl mt-10">
                        Start Profile Transfer
                    </Button>
                </>
            )}

            <div className="mt-8">
                <Link href="/browse" className="text-muted-foreground hover:underline">
                    No, I'll do this later.
                </Link>
            </div>
        </div>
      </main>
      <div className="bg-[#111] mt-12">
        <Footer />
      </div>
    </div>
  );
}

