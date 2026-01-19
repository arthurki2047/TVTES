'use client';
import { useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getChannelById, getChannels } from '@/lib/data';
import type { Channel } from '@/lib/types';
import { VideoPlayer } from '@/components/video-player';
import { FavoriteToggleButton } from '@/components/favorite-toggle-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useRecentlyPlayed } from '@/hooks/use-recently-played';

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const channelId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addRecentlyPlayed } = useRecentlyPlayed();
  
  const channel = getChannelById(channelId);
  
  useEffect(() => {
    if (channelId) {
      addRecentlyPlayed(channelId);
    }
  }, [channelId, addRecentlyPlayed]);

  const handleBack = useCallback(() => {
      router.push('/');
  }, [router]);
  
  useEffect(() => {
    if (!channel) {
      router.replace('/');
    }
  }, [channel, router]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const listType = searchParams.get('list') ? 'list' : searchParams.get('category') ? 'category' : 'list';
    const listValue = searchParams.get('list') || searchParams.get('category') || 'all';

    let currentChannelList: Channel[];
    if(listType === 'category') {
        currentChannelList = getChannels(listValue);
    } else {
        currentChannelList = getChannels();
    }
    
    const currentIndex = currentChannelList.findIndex(c => c.id === channelId);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'left') { // Swipe left for next channel
      nextIndex = (currentIndex + 1) % currentChannelList.length;
    } else { // Swipe right for previous channel
      nextIndex = (currentIndex - 1 + currentChannelList.length) % currentChannelList.length;
    }
    
    const nextChannel = currentChannelList[nextIndex];
    router.push(`/watch/${nextChannel.id}?${listType}=${listValue}`);
  };

  if (!channel) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black">
       <div className="relative">
         <VideoPlayer src={channel.streamUrl} type={channel.type} onSwipe={handleSwipe} onBack={handleBack} />
       </div>
       <div className="flex-1 overflow-y-auto bg-background p-4 pb-20 md:pb-4">
        <div className="container mx-auto max-w-4xl">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image
                        src={channel.logoUrl}
                        alt={`Logo for ${channel.name}`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg border bg-card object-contain p-1"
                        data-ai-hint={channel.logoImageHint}
                    />
                    <div>
                        <h1 className="font-headline text-3xl font-bold">{channel.name}</h1>
                        <p className="text-muted-foreground">{channel.category}</p>
                    </div>
                </div>
                <FavoriteToggleButton channelId={channel.id} channelName={channel.name} className="h-12 w-12 shrink-0"/>
            </div>
            <div className="mt-4 prose prose-invert max-w-none">
                <p>You are watching {channel.name}. Swipe left or right on the player to switch channels.</p>
            </div>
            <div className="mt-8 text-center">
                <Button asChild size="lg" className="h-auto px-16 py-6 text-2xl font-bold">
                    <Link href="/">
                        <Home className="mr-4 h-8 w-8" />
                        Home
                    </Link>
                </Button>
            </div>
        </div>
       </div>
       <BottomNav />
    </div>
  );
}
