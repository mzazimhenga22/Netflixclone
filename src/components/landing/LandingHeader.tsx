import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from 'lucide-react';


const LandingHeader = ({ signInUrl = "/signup/registration" }: { signInUrl?: string }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-6 w-auto sm:h-9" />
        <div className="flex items-center gap-4">
          <Select defaultValue="en">
            <SelectTrigger className="w-auto bg-black/50 text-white border-white/50 hidden sm:flex">
              <Globe className="inline-block mr-2" size={16}/>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href={signInUrl}>Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
