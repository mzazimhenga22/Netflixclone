import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Logo from '@/components/Logo';

const profiles = [
  { name: 'John', avatar: 'https://picsum.photos/seed/avatar1/200/200' },
  { name: 'Jane', avatar: 'https://picsum.photos/seed/avatar2/200/200' },
];

export default function ProfileSetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="absolute top-8 left-8">
            <Logo className="h-8 w-auto" />
        </div>
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl mb-12">Who's watching?</h1>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {profiles.map((profile) => (
            <Link href="/browse" key={profile.name}>
                <div className="group flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition">
                        <Image src={profile.avatar} alt={profile.name} width={160} height={160} className="object-cover" />
                    </div>
                    <p className="text-gray-400 group-hover:text-white transition">{profile.name}</p>
                </div>
            </Link>
          ))}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-md flex items-center justify-center bg-gray-800/50 border-2 border-transparent group-hover:bg-gray-700 transition">
              <PlusCircle className="h-16 w-16 text-gray-400 group-hover:text-white transition" />
            </div>
            <p className="text-gray-400 group-hover:text-white transition">Add Profile</p>
          </div>
        </div>
        <Button variant="outline" className="mt-16 bg-transparent border-gray-500 text-gray-500 hover:text-white hover:border-white px-8 py-3 text-lg">
          Manage Profiles
        </Button>
      </div>
    </div>
  );
}
