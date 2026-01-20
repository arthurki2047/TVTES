import Link from 'next/link';
import { Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Tv className="h-6 w-6 text-primary" />
      <span className="font-headline text-2xl font-bold tracking-tighter">
        Amar Tv
      </span>
    </Link>
  );
}
