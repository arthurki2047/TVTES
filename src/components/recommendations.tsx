import * as React from 'react';
import { getPersonalizedChannelRecommendations } from '@/ai/flows/personalized-channel-recommendations';
import { getChannels } from '@/lib/data';
import type { Channel } from '@/lib/types';
import { ChannelCard } from '@/components/channel-card';
import { Skeleton } from '@/components/ui/skeleton';

async function RecommendationsContent() {
  const mockViewingHistory = ['CBS News', 'PGA Tour'];
  
  try {
    const { recommendedChannels } = await getPersonalizedChannelRecommendations({
      viewingHistory: mockViewingHistory,
    });

    if (!recommendedChannels || recommendedChannels.length === 0) {
      return <p className="text-muted-foreground">No recommendations available right now.</p>;
    }
    
    const allChannels = getChannels();
    const recommendedChannelObjects = recommendedChannels
        .map(name => allChannels.find(c => c.name === name))
        .filter((c): c is Channel => c !== undefined);

    if(recommendedChannelObjects.length === 0) {
        return <p className="text-muted-foreground">Could not find matching channels for recommendations.</p>;
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedChannelObjects.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return <p className="text-destructive">Failed to load recommendations. Please try again later.</p>;
  }
}

function RecommendationsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function Recommendations() {
  return (
    <div className="space-y-4">
      <h2 className="font-headline text-3xl font-bold">For You</h2>
      <React.Suspense fallback={<RecommendationsSkeleton />}>
        <RecommendationsContent />
      </React.Suspense>
    </div>
  );
}
