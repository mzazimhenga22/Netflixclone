import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

const SignupHeader = () => {
  const auth = useAuth();
  
  const handleSignOut = () => {
    if (auth) {
        auth.signOut();
    }
  }

  return (
    <header className="py-4 px-4 sm:px-8 border-b border-gray-700">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-6 w-auto sm:h-9" />
        <Button onClick={auth?.currentUser ? handleSignOut : undefined} asChild={!auth?.currentUser} variant="link" className="text-lg font-semibold text-white hover:underline">
            {auth?.currentUser ? <span>Sign Out</span> : <Link href="/login">Sign In</Link>}
        </Button>
      </div>
    </header>
  );
};

export default SignupHeader;
