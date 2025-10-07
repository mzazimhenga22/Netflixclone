
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from '@/components/Logo';
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { countries } from '@/lib/countries';
import type { Profile } from '@/hooks/useProfile';


interface ProfileFormProps {
  profile?: Profile;
  onSave: (profileData: Omit<Profile, 'id' | 'favoriteGenreId'> & { id?: string }) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

const avatars = [
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar1.png?alt=media&token=e827b5f6-3914-4395-8292-39324135502c",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar2.png?alt=media&token=255776c4-7389-4809-810a-2004278a9947",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar3.png?alt=media&token=86641A58-348A-42A6-A2A5-364F3539079A",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar4.png?alt=media&token=C3F4A8B3-3B3B-4F6A-915A-69A6B2A8A3F6",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar5.png?alt=media&token=E9A4B3C5-5A3E-4B3A-9E2A-1A2B3C4D5E6F",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar6.png?alt=media&token=A9B8C7D6-5E4F-3A2B-1C0D-9E8F7A6B5C4D",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar7.png?alt=media&token=B8C9D0E7-6F5A-4B3C-2D1E-0F9E8D7C6B5A",
    "https://firebasestorage.googleapis.com/v0/b/studio-9973247152-e6670.appspot.com/o/avatars%2Favatar8.png?alt=media&token=D7E8F9A0-1B2C-3D4E-5F6A-7B8C9D0E1F2A"
];

export default function ProfileForm({ profile, onSave, onCancel, onDelete }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || avatars[0]);
  const [isLocked, setIsLocked] = useState(profile?.isLocked || false);
  const [pin, setPin] = useState(profile?.pin || '');
  const [country, setCountry] = useState(profile?.country || 'US');

  const handleSave = () => {
    onSave({
      id: profile?.id,
      name,
      avatar,
      isLocked,
      pin: isLocked ? pin : undefined,
      country,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="absolute top-8 left-8">
        <Logo className="h-8 w-auto" />
      </div>
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl px-8">
          <h1 className="text-4xl md:text-6xl text-center mb-8">{profile ? 'Edit Profile' : 'Add Profile'}</h1>
          <div className="border-t border-b border-gray-600 py-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden flex-shrink-0">
              <Image src={avatar} alt="Selected Avatar" width={160} height={160} className="object-cover"/>
            </div>
            <div className="flex-grow space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="sr-only">Profile Name</Label>
                <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="bg-gray-700 border-none h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                 <Label htmlFor="country" className="text-gray-400">Region</Label>
                 <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-full bg-gray-700 border-none h-12 text-lg">
                        <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                        {countries.map(c => (
                            <SelectItem key={c.iso_3166_1} value={c.iso_3166_1}>{c.english_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                  <h3 className="text-xl text-gray-400">Avatar</h3>
                   <div className="flex flex-wrap gap-2">
                       {avatars.map(av => (
                           <button key={av} onClick={() => setAvatar(av)} className={`w-16 h-16 rounded-md overflow-hidden border-2 ${avatar === av ? 'border-white' : 'border-transparent'} hover:border-white transition`}>
                               <Image src={av} alt="Avatar option" width={64} height={64} />
                           </button>
                       ))}
                   </div>
              </div>
               
              <div className="space-y-4 border-t border-gray-600 pt-6">
                 <h3 className="text-xl text-gray-400">Profile Lock</h3>
                 <div className="flex items-center space-x-3">
                    <Checkbox id="isLocked" checked={isLocked} onCheckedChange={(checked) => setIsLocked(!!checked)} />
                    <Label htmlFor="isLocked" className="text-lg">Require a PIN to access this profile.</Label>
                 </div>
                 {isLocked && (
                     <div className="pl-8">
                         <Label htmlFor="pin" className="text-muted-foreground">Profile PIN</Label>
                         <Input 
                            id="pin"
                            type="password"
                            value={pin}
                            maxLength={4}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val) && val.length <= 4) {
                                    setPin(val);
                                }
                            }}
                            placeholder="----"
                            className="bg-gray-700 border-gray-500 w-32 h-12 text-center text-lg tracking-[0.5rem] mt-2"
                         />
                         <p className="text-xs text-muted-foreground mt-2">Enter 4 numbers to create a PIN for this profile.</p>
                     </div>
                 )}
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-4">
             <Button onClick={handleSave} size="lg" className="px-10 text-lg bg-white text-black hover:bg-white/80">Save</Button>
             <Button onClick={onCancel} variant="outline" size="lg" className="px-10 text-lg border-gray-500 text-gray-500 hover:border-white hover:text-white">Cancel</Button>
            {profile && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="lg" className="px-10 text-lg border-gray-500 text-gray-500 hover:border-red-500 hover:text-red-500">
                        <Trash2 className="mr-2 h-5 w-5" />
                        Delete Profile
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This profile, along with its viewing history and settings, will be permanently deleted. You can't undo this.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(profile.id)} className="bg-primary hover:bg-primary/80">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
