import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Button
        asChild
        variant="ghost"
        className="absolute top-4 left-4 md:top-8 md:left-8"
      >
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[450px] space-y-6">
          <div className="flex flex-col space-y-4 text-center">
            <h1 className="text-3xl">
              <Logo />
            </h1>
            <p className="text-lg text-muted-foreground">
              Document your truth. Before they erase it.
            </p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="underline underline-offset-4 hover:text-primary"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}