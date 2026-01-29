'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const notifications = [
    {
    id: '5',
    title: 'New Channel Added!',
    description: 'BIG MAGIC has been added to the Entertainment category.',
    time: '1m ago',
    read: false,
    avatar: 'https://picsum.photos/seed/notif5/40/40',
  },
  {
    id: '6',
    title: 'New Channel Added!',
    description: 'DD TRIPURA has been added to the Entertainment category.',
    time: '2m ago',
    read: false,
    avatar: 'https://picsum.photos/seed/notif6/40/40',
  },
];

export function NotificationsButton() {
  const hasUnread = notifications.some(n => !n.read);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasUnread && (
             <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <div className="flex flex-col">
            {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                <div key={notification.id}>
                    <div className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={notification.avatar} alt="Notification avatar" />
                        <AvatarFallback>
                            <Bell className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    {!notification.read && <div className="mt-1 h-3 w-3 rounded-full bg-primary" />}
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 mt-8 rounded-lg bg-muted/50">
                    <Bell className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Notifications Yet</h3>
                    <p className="mt-2 text-muted-foreground">Check back later for updates.</p>
                </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
