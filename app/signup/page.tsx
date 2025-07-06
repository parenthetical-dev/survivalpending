"use client";

import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function SignupPage() {
  return (
    <>
      <Navbar />

      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center p-4 pt-20 md:pt-24">
          <div className="w-full max-w-[450px] space-y-4 md:space-y-6">
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
    </>
  );
}