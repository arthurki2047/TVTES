'use client';

import * as React from 'react';
import { useRecentlyPlayed } from '@/hooks/use-recently-played';
import { getChannels } from '@/lib/data';
import type { Channel } from '@/lib/types';
import { ChannelCard } from '@/components/channel-card';
import { Skeleton } from '@/components/ui/skeleton';

function RecentlyPlayedSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
    );
}

export function RecentlyPlayed() {
  const { recentlyPlayed, isLoaded } = useRecentlyPlayed();
  
  const recentlyPlayedChannels = React.useMemo(() => {
    if (!isLoaded) return [];
    const allChannels = getChannels();
    return recentlyPlayed
      .map(id => allChannels.find(c => c.id === id))
      .filter((c): c is Channel => c !== undefined);
  }, [isLoaded, recentlyPlayed]);

  if (!isLoaded) {
    return (
        <section className="space-y-4">
            <h2 className="font-headline text-3xl font-bold">Recently Watched</h2>
            <RecentlyPlayedSkeleton />
        </section>
    );
  }

  if (recentlyPlayedChannels.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="font-headline text-3xl font-bold">Recently Watched</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {recentlyPlayedChannels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
    </section>
  );
}
