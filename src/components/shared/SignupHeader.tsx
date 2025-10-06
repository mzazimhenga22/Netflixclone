import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const SignupHeader = () => {
  return (
    <header className="py-4 px-4 sm:px-8 border-b border-gray-700">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-6 w-auto sm:h-9" />
        <Button asChild variant="link" className="text-lg font-semibold text-white hover:underline">
            <Link href="/browse">Sign In</Link>
        </Button>
      </div>
    </header>
  );
};

export default SignupHeader;
