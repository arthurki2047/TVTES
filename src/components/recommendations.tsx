'use client';

import * as React from 'react';
import { useRecentlyPlayed } from '@/hooks/use-recently-played';
import { getChannels } from '@/lib/data';
import type { Channel } from '@/lib/types';
import { ChannelCard } from '@/components/channel-card';
import { Skeleton } from '@/components/ui/skeleton';

function RecentlyPlayedSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
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

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-3xl font-bold">Recently Watched</h2>
      {!isLoaded ? (
        <RecentlyPlayedSkeleton />
      ) : recentlyPlayedChannels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recentlyPlayedChannels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You haven&apos;t watched any channels yet. Watch a channel to see it here.</p>
      )}
    </div>
  );
}
