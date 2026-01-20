'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ListVideo, Search, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteLogo } from './site-logo';
import { Button } from './ui/button';
import { useVideoPlayer } from '@/context/video-player-context';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: ListVideo },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { playerRef } = useVideoPlayer();

  const handleHomeClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname.startsWith('/watch/') && playerRef?.current && document.pictureInPictureEnabled && !playerRef.current.disablePictureInPicture) {
      e.preventDefault();
      try {
        if (document.pictureInPictureElement !== playerRef.current) {
          await playerRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error("PiP request failed", err);
      } finally {
        router.push('/');
      }
    }
  };


  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 hidden w-full border-b bg-background/80 backdrop-blur-sm md:block">
        <div className="container flex h-16 items-center justify-between">
          <SiteLogo />
          <nav className="flex items-center space-x-1">
             {navItems.map((item) => {
                const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                    <Button key={item.label} variant={isActive ? "secondary" : "ghost"} asChild>
                        <Link href={item.href} onClick={item.href === '/' ? handleHomeClick : undefined}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm md:hidden">
        <div className="container mx-auto flex h-16 max-w-md items-center justify-around">
          {navItems.map((item) => {
            const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.href === '/' ? handleHomeClick : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary',
                  isActive && 'text-primary'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
