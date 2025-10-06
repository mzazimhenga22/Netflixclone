
"use client";

import { useProfile } from '@/hooks/useProfile';
import Navbar from "@/components/browse/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AccountPage() {
    const { profile } = useProfile();

    if (!profile) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-black text-white">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading account details...</p>
              </div>
          </div>
        )
    }

    return (
        <div className="bg-background min-h-screen">
            <Navbar />
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-semibold mb-6">Account</h1>
                    
                    <hr className="border-gray-600" />

                    <div className="grid md:grid-cols-[1fr_2fr] gap-4 py-6">
                        <h2 className="font-semibold text-gray-400 text-lg">MEMBERSHIP & BILLING</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{`user${profile.id}@streamclone.com`}</p>
                                    <p className="text-gray-500">Password: ********</p>
                                </div>
                                <div className='text-right'>
                                    <Button variant="link" className="text-blue-500 p-0 h-auto">Change email</Button>
                                    <br />
                                    <Button variant="link" className="text-blue-500 p-0 h-auto">Change password</Button>
                                </div>
                            </div>
                             <div className="flex justify-between items-start border-t border-gray-700 pt-4">
                                <div>
                                    <p className="font-bold">Card: **** **** **** 1234</p>
                                    <p className="text-gray-500">Your next billing date is July 31, 2024</p>
                                </div>
                                <div className='text-right'>
                                     <Button variant="link" className="text-blue-500 p-0 h-auto">Manage payment info</Button>
                                    <br />
                                     <Button variant="link" className="text-blue-500 p-0 h-auto">Add backup payment</Button>
                                </div>
                            </div>
                            <div className="flex justify-end border-t border-gray-700 pt-4">
                               <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-300 border-0">Cancel Membership</Button>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-600" />

                     <div className="grid md:grid-cols-[1fr_2fr] gap-4 py-6">
                        <h2 className="font-semibold text-gray-400 text-lg">PLAN DETAILS</h2>
                        <div className="flex justify-between items-center">
                            <div>
                                <p><span className="font-bold">Standard</span> 1080p</p>
                            </div>
                            <Button variant="link" className="text-blue-500">Change plan</Button>
                        </div>
                    </div>
                    
                    <hr className="border-gray-600" />

                    <div className="grid md:grid-cols-[1fr_2fr] gap-4 py-6">
                        <h2 className="font-semibold text-gray-400 text-lg">PROFILE & PARENTAL CONTROLS</h2>
                        <div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Image src={profile.avatar} alt={profile.name} width={64} height={64} className="rounded-md" />
                                    <div>
                                        <p className="font-bold">{profile.name}</p>
                                        <p className="text-gray-500 text-sm">All Maturity Ratings</p>
                                    </div>
                                </div>
                                <Link href="/profiles/setup">
                                    <ChevronRight className="h-6 w-6 text-gray-400" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    <hr className="border-gray-600" />
                    
                     <div className="grid md:grid-cols-[1fr_2fr] gap-4 py-6">
                        <h2 className="font-semibold text-gray-400 text-lg">SETTINGS</h2>
                        <div className="space-y-2">
                             <Button variant="link" className="text-blue-500 p-0 h-auto block">Sign out of all devices</Button>
                             <Button variant="link" className="text-blue-500 p-0 h-auto block">Download your personal information</Button>
                        </div>
                    </div>
                    
                    <hr className="border-gray-600" />

                </div>
            </main>
            <div className="bg-[#111] mt-12">
                <Footer />
            </div>
        </div>
    );
}
