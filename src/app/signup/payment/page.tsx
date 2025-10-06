import Link from 'next/link';
import SignupHeader from '@/components/shared/SignupHeader';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PaymentPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <SignupHeader />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md px-8">
          <div className="text-left mb-6">
            <Lock className="h-8 w-8 text-primary" />
            <p className="text-xs mt-4">STEP 3 OF 3</p>
            <h1 className="text-3xl font-bold mt-2">Set up your payment.</h1>
            <p className="mt-4 text-lg">
              Your membership starts as soon as you set up payment.
            </p>
             <p className="mt-2 text-lg font-semibold">
              No commitments.
              <br />
              Cancel online anytime.
            </p>
          </div>

            <div className="space-y-3">
                <Select>
                    <SelectTrigger className="h-16 text-lg bg-transparent border-2 border-gray-600">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-7 w-7" />
                            <SelectValue placeholder="Credit or Debit Card" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="card">Credit or Debit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="gift">Gift Code</SelectItem>
                    </SelectContent>
                </Select>

                <Input placeholder="Card number" className="h-14 bg-gray-800 border-gray-600" />
                 <div className="flex gap-3">
                    <Input placeholder="Expiration date" className="h-14 bg-gray-800 border-gray-600" />
                    <Input placeholder="CVV" className="h-14 bg-gray-800 border-gray-600" />
                </div>
                <Input placeholder="Name on card" className="h-14 bg-gray-800 border-gray-600" />
            </div>

            <div className="mt-4 p-4 bg-gray-800/50 rounded-md">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold">$15.49/month</p>
                        <p className="text-muted-foreground">Standard Plan</p>
                    </div>
                    <Button variant="link" className="text-primary hover:text-primary/80">Change</Button>
                </div>
            </div>

          <p className="text-xs text-muted-foreground mt-4">
            By clicking the “Start Membership” button, you agree to our Terms of Use and Privacy Statement.
          </p>

          <Button asChild size="lg" className="w-full h-14 text-2xl mt-6">
            <Link href="/profiles/setup">Start Membership</Link>
          </Button>
        </div>
      </main>
      <div className="bg-[#111] mt-12">
        <Footer />
      </div>
    </div>
  );
}
