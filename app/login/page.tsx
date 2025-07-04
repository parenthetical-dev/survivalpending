import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
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
              Still here. Still documenting.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Need an account?{' '}
            <Link 
              href="/signup" 
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}