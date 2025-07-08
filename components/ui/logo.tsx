'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-black tracking-tight',
        className,
      )}
      style={{ fontFamily: 'Satoshi, sans-serif' }}
    >
      Survival Pending
      <span className="inline-block w-[3px] h-[1.2em] bg-current ml-[2px] animate-blink" />
    </span>
  );
}