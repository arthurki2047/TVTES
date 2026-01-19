import { SiteLogo } from '@/components/site-logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, ListVideo, Search, Star, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: ListVideo },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/profile', label: 'Profile', icon: User },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hidden w-full border-b bg-background/80 backdrop-blur-sm md:block">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <SiteLogo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
             {navItems.map((item) => (
                <Button key={item.label} variant="ghost" asChild>
                    <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Link>
                </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
