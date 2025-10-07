
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import { PlusCircle, Pencil, Lock } from 'lucide-react';
import ProfileForm from '@/components/profiles/ProfileForm';
import { useProfile, type Profile } from '@/hooks/useProfile';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


export default function ProfileSetupPage() {
  const { user, profiles, areProfilesLoading, setActiveProfile, isUserLoading } = useProfile();
  const firestore = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | 'new' | null>(null);
  const [selectedProfileForPin, setSelectedProfileForPin] = useState<Profile | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleProfileSelect = (profile: Profile) => {
    if (isEditing) {
      setEditingProfile(profile);
    } else if (profile.isLocked) {
      setSelectedProfileForPin(profile);
    } else {
      setActiveProfile(profile);
      window.location.href = '/browse';
    }
  };

  const getProfilesCollectionRef = () => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`).collection('profiles');
  }

  const handleSaveProfile = (profileData: Omit<Profile, 'id'> & { id?: string }) => {
    if (!user || !firestore) return;
    const profilesCollection = getProfilesCollectionRef();
    if (!profilesCollection) return;

    const { id, ...dataToSave } = profileData;

    if (id) {
      // Edit existing profile
      const docRef = doc(profilesCollection, id);
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });
    } else {
      // Add new profile
      const docRef = doc(profilesCollection); // Auto-generates ID
      setDocumentNonBlocking(docRef, dataToSave, {});
    }
    setEditingProfile(null);
  };
  
  const handleDeleteProfile = (profileId: string) => {
    const profilesCollection = getProfilesCollectionRef();
    if (!profilesCollection) return;

    const docRef = doc(profilesCollection, profileId);
    deleteDocumentNonBlocking(docRef);
    setEditingProfile(null);
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProfileForPin && selectedProfileForPin.pin === pin) {
        setActiveProfile(selectedProfileForPin);
        window.location.href = '/browse';
    } else {
      setPinError(true);
      setPin('');
    }
  };

  if (isUserLoading || areProfilesLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
              <LoadingSpinner />
          </div>
      )
  }

  if (selectedProfileForPin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Logo className="absolute top-8 left-8 h-8 w-auto" />
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-2">Profile Locked</h2>
          <p className="text-muted-foreground mb-6">Enter your PIN to unlock this profile.</p>
          <div className="flex items-center gap-4 mb-4">
            <Image src={selectedProfileForPin.avatar} alt={selectedProfileForPin.name} width={80} height={80} className="rounded-md"/>
            <div>
              <p className="text-lg">{selectedProfileForPin.name}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>This profile is locked.</span>
              </div>
            </div>
          </div>
          <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-4">
             <Input 
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val) && val.length <= 4) {
                        setPin(val);
                        setPinError(false);
                    }
                }}
                className="w-48 text-center text-2xl tracking-[1rem] bg-gray-800 border-gray-600 h-14"
                placeholder="----"
             />
             {pinError && <p className="text-primary text-sm">Incorrect PIN. Please try again.</p>}
             <div className="flex gap-4 mt-6">
                <Button type="submit" size="lg" className="px-8">Enter</Button>
                <Button variant="outline" size="lg" className="px-8" onClick={() => { setSelectedProfileForPin(null); setPin(''); setPinError(false); }}>Cancel</Button>
             </div>
          </form>
            <Button variant="link" className="mt-4 text-muted-foreground">Forgot PIN?</Button>
        </div>
      </div>
    );
  }

  if (editingProfile) {
    const profileToEdit = editingProfile === 'new' ? undefined : profiles.find(p => p.id === (editingProfile as Profile).id);
    return <ProfileForm profile={profileToEdit} onSave={handleSaveProfile} onCancel={() => setEditingProfile(null)} onDelete={handleDeleteProfile}/>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white py-12">
      <div className="absolute top-8 left-8">
        <Logo className="h-8 w-auto" />
      </div>
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl mb-12">{isEditing ? "Manage Profiles" : "Who's watching?"}</h1>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition">
                <Image src={profile.avatar} alt={profile.name} width={160} height={160} className="object-cover" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Pencil className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 group-hover:text-white transition">{profile.name}</p>
                {profile.isLocked && !isEditing && <Lock className="h-4 w-4 text-gray-400"/>}
              </div>
            </div>
          ))}
          {profiles.length < 5 && (
            <div onClick={() => setEditingProfile('new')} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-md flex items-center justify-center bg-transparent border-2 border-gray-600 group-hover:bg-gray-800 transition">
                <PlusCircle className="h-16 w-16 text-gray-400 group-hover:text-white transition" />
              </div>
              <p className="text-gray-400 group-hover:text-white transition">Add Profile</p>
            </div>
          )}
        </div>
        <Button 
            variant="outline" 
            className="mt-16 bg-transparent border-gray-500 text-gray-500 hover:text-white hover:border-white px-10 py-3 text-lg"
            onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Done" : "Manage Profiles"}
        </Button>
      </div>
    </div>
  );
}
