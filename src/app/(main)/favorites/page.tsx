'use client';

import { useFavorites } from '@/hooks/use-favorites';
import { channels } from '@/lib/data';
import { ChannelCard } from '@/components/channel-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();

  const favoriteChannels = channels.filter(channel => favorites.includes(channel.id));

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Favorites</h1>
      {!isLoaded ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : favoriteChannels.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favoriteChannels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <Star className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Favorites Yet</h3>
            <p className="mt-2 text-muted-foreground">Click the star on a channel to add it to your favorites.</p>
        </div>
      )}
    </div>
  );
}
