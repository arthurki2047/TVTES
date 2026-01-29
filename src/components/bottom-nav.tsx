'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ListVideo, Search, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteLogo } from './site-logo';
import { Button } from './ui/button';
import { NotificationsButton } from './notifications-button';
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
  const { playerRef, playerActionsRef } = useVideoPlayer();

  const handleNav = async (href: string) => {
    const video = playerRef?.current;
    if (video && !video.paused && pathname.startsWith('/watch/') && href !== pathname) {
      try {
        if (playerActionsRef?.current && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
          await playerActionsRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error("Failed to enter PiP mode automatically:", error);
      }
    }
    router.push(href);
  };

  const renderDesktopNavItem = (item: typeof navItems[0]) => {
    const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
    return (
        <Button
            key={item.label}
            variant="ghost"
            onClick={() => handleNav(item.href)}
            className={cn(
                "transition-all duration-300",
                isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-primary"
            )}
        >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
        </Button>
    );
  }

  const renderMobileNavItem = (item: typeof navItems[0]) => {
      const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
      return (
        <div
          key={item.href}
          onClick={() => handleNav(item.href)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 p-2 rounded-full h-14 w-14 transition-all duration-300 cursor-pointer',
            isActive ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 'text-muted-foreground hover:text-primary'
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-bold">{item.label}</span>
        </div>
      );
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 hidden w-full border-b bg-background/80 backdrop-blur-sm md:block">
        <div className="container flex h-16 items-center justify-between">
          <SiteLogo />
          <div className="flex items-center gap-1">
            <nav className="flex items-center space-x-1">
               {navItems.map(renderDesktopNavItem)}
            </nav>
            <NotificationsButton />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 md:hidden">
        <nav className="mx-auto w-full max-w-md rounded-full border bg-background/80 shadow-lg backdrop-blur-sm">
          <div className="flex h-16 items-center justify-around">
            {navItems.map(renderMobileNavItem)}
          </div>
        </nav>
      </div>
    </>
  );
}
