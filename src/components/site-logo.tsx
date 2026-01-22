'use client';

import Link from 'next/link';
import { Tv2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Tv2 className="h-6 w-6 text-primary" />
      <span className="font-headline text-2xl font-bold tracking-tighter">
        Amar TV
      </span>
    </Link>
  );
}
