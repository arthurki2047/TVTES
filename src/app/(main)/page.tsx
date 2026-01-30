'use client';

import { useState } from 'react';
import { ChannelCard } from '@/components/channel-card';
import { RecentlyPlayed } from '@/components/recommendations';
import { getChannels } from '@/lib/data';
import { SiteLogo } from '@/components/site-logo';
import Link from 'next/link';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelListItem } from '@/components/channel-list-item';

export default function HomePage() {
  const [view, setView] = useState('grid');
  const channels = getChannels();
  const totalChannels = channels.length;

  return (
    <div className="container py-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between md:hidden">
          <SiteLogo />
          <Link href="/search">
            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-sm font-bold">Quick Search</span>
              <Search className="h-7 w-7" />
            </div>
          </Link>
        </div>

        <RecentlyPlayed />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold">All Channels</h2>
            <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('grid')} className="rounded-full gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                </Button>
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-full gap-2">
                    <List className="h-4 w-4" />
                    List
                </Button>
            </div>
            <div className="hidden sm:block text-muted-foreground font-bold">{totalChannels} Channels</div>
          </div>
          
          {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {channels.map(channel => (
                <ChannelCard key={channel.id} channel={channel} listType="list" listValue="all" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {channels.map(channel => (
                <ChannelListItem key={channel.id} channel={channel} listType="list" listValue="all" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
