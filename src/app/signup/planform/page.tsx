
"use client";

import { useState } from 'react';
import Link from 'next/link';
import SignupHeader from '@/components/shared/SignupHeader';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Check, Tv2, Laptop, Smartphone, Tablet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

const plansData = [
    { name: 'Basic', price: '$9.99', quality: 'Good', resolution: '720p', devices: '1' },
    { name: 'Standard', price: '$15.49', quality: 'Better', resolution: '1080p', devices: '2' },
    { name: 'Premium', price: '$19.99', quality: 'Best', resolution: '4K+HDR', devices: '4' },
];

export default function PlanFormPage() {
  const [selectedPlan, setSelectedPlan] = useState('Standard');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SignupHeader />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-5xl px-4 md:px-8">
          <div className="text-left mb-8">
            <p className="text-xs">STEP 2 OF 3</p>
            <h1 className="text-3xl font-bold mt-2">Choose your plan.</h1>
            <ul className="mt-6 space-y-3 text-lg">
                <li className="flex items-center gap-3"><Check className="text-primary h-7 w-7" /> No commitments, cancel anytime.</li>
                <li className="flex items-center gap-3"><Check className="text-primary h-7 w-7" /> Everything on StreamClone for one low price.</li>
                <li className="flex items-center gap-3"><Check className="text-primary h-7 w-7" /> No ads and no extra fees. Ever.</li>
            </ul>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-0">
                  <TableHead className="w-[30%]"></TableHead>
                  {plansData.map((plan) => (
                    <TableHead 
                        key={plan.name} 
                        className={cn(
                            "text-center p-4 cursor-pointer", 
                            selectedPlan === plan.name && "bg-primary/20"
                        )}
                        onClick={() => setSelectedPlan(plan.name)}
                    >
                        <div className={cn(
                            "w-28 h-28 mx-auto flex items-center justify-center font-bold text-xl rounded-md transition-colors", 
                            selectedPlan === plan.name ? "bg-primary text-primary-foreground" : "bg-primary/80 text-primary-foreground/90 hover:bg-primary/90"
                        )}>
                            {plan.name}
                        </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Monthly price</TableCell>
                  {plansData.map((plan) => (
                    <TableCell 
                        key={plan.name} 
                        className={cn(
                            "text-center font-bold cursor-pointer", 
                            selectedPlan === plan.name && "text-primary"
                        )}
                        onClick={() => setSelectedPlan(plan.name)}
                    >
                        {plan.price}
                    </TableCell>
                  ))}
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Video quality</TableCell>
                  {plansData.map((plan) => (
                    <TableCell 
                        key={plan.name} 
                        className={cn(
                            "text-center font-bold cursor-pointer", 
                            selectedPlan === plan.name && "text-primary"
                        )}
                        onClick={() => setSelectedPlan(plan.name)}
                    >
                        {plan.quality}
                    </TableCell>
                  ))}
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Resolution</TableCell>
                  {plansData.map((plan) => (
                    <TableCell 
                        key={plan.name} 
                        className={cn(
                            "text-center font-bold cursor-pointer", 
                            selectedPlan === plan.name && "text-primary"
                        )}
                        onClick={() => setSelectedPlan(plan.name)}
                    >
                        {plan.resolution}
                    </TableCell>
                  ))}
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Watch on your TV, computer, mobile phone and tablet</TableCell>
                  {plansData.map((plan) => (
                    <TableCell 
                        key={plan.name} 
                        className={cn(
                            "text-center cursor-pointer", 
                            selectedPlan === plan.name && "text-primary"
                        )}
                        onClick={() => setSelectedPlan(plan.name)}
                    >
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                            <Tv2 className="h-5 w-5" />
                            <Laptop className="h-5 w-5" />
                            <Smartphone className="h-5 w-5" />
                            <Tablet className="h-5 w-5" />
                        </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            HD (720p), Full HD (1080p), Ultra HD (4K) and HDR availability subject to your internet service and device capabilities. Not all content is available in all resolutions. See our Terms of Use for more details.
          </p>

          <div className="flex justify-center mt-8">
            <Button asChild size="lg" className="w-full max-w-md h-14 text-2xl">
              <Link href="/signup/payment">Next</Link>
            </Button>
          </div>
        </div>
      </main>
      <div className="bg-[#111] mt-12">
        <Footer />
      </div>
    </div>
  );
}
