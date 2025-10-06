
import Link from 'next/link';
import Image from 'next/image';
import SignupHeader from '@/components/shared/SignupHeader';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function TransferProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SignupHeader />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-lg text-center px-8">
          <div className="relative mx-auto w-48 h-32 mb-8">
            <Image src="https://picsum.photos/seed/avatar1/100/100" alt="Profile" width={100} height={100} className="rounded-full absolute top-0 left-0 z-10 border-4 border-black" />
            <Image src="https://picsum.photos/seed/avatar2/100/100" alt="Profile" width={100} height={100} className="rounded-full absolute bottom-0 right-0" />
            <div className="absolute inset-0 flex items-center justify-center">
                 <ChevronRight className="h-16 w-16 text-primary animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mt-2">Transfer your profile.</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Admirers of your taste in TV? Spongers of your account? It's easy to transfer a profile to a new account.
          </p>

           <div className="text-left mt-8 space-y-4 max-w-md mx-auto">
               <div className="flex items-start gap-4">
                    <span className="text-primary text-2xl font-bold">✓</span>
                    <p>
                        <span className="font-semibold">Your recommendations,</span> viewing history, My List, and other settings will move with you.
                    </p>
               </div>
                <div className="flex items-start gap-4">
                    <span className="text-primary text-2xl font-bold">✓</span>
                    <p>
                        You can <span className="font-semibold">keep a copy</span> of the profile on this account.
                    </p>
                </div>
           </div>

          <Button asChild size="lg" className="w-full max-w-sm h-14 text-2xl mt-10">
            <Link href="/signup/registration">Start Profile Transfer</Link>
          </Button>

          <div className="mt-8">
            <Link href="/browse" className="text-muted-foreground hover:underline">
                No, I'll set this up later.
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
