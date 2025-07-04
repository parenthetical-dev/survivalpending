import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Home } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 md:top-8 md:left-8 p-2 md:p-2"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
          <Home className="h-4 w-4 md:hidden" />
          <span className="hidden md:inline">Back to home</span>
        </Link>
      </Button>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[450px] space-y-4 md:space-y-6">
          <div className="flex flex-col space-y-3 md:space-y-4 text-center">
            <h1 className="text-2xl md:text-3xl">
              <Logo />
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
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