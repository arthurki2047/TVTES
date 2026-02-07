'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getChannelById, getChannels } from '@/lib/data';
import type { Channel } from '@/lib/types';
import { VideoPlayer, type VideoPlayerHandles } from '@/components/video-player';
import { FavoriteToggleButton } from '@/components/favorite-toggle-button';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useRecentlyPlayed } from '@/hooks/use-recently-played';
import { useVideoPlayer } from '@/context/video-player-context';

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const videoPlayerRef = useRef<VideoPlayerHandles>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const channelId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addRecentlyPlayed } = useRecentlyPlayed();
  const { setPlayerActionsRef, playerActionsRef } = useVideoPlayer();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const channel = getChannelById(channelId);
  
  // This effect will run when the component mounts.
  // It checks if there's an active Picture-in-Picture element
  // and closes it. This ensures that when you switch to a new
  // channel, the old channel's PiP window is terminated.
  useEffect(() => {
    const exitPip = async () => {
      if (document.pictureInPictureElement) {
        try {
          await document.exitPictureInPicture();
        } catch (error) {
          console.error("Failed to exit PiP mode on channel switch:", error);
        }
      }
    };
    exitPip();
  }, []);

  const decodedStreamUrl = useMemo(() => {
    if (!channel || channel.type !== 'iframe') return channel?.streamUrl || '';
    try {
      const decoded = atob(channel.streamUrl);
      if (decoded.startsWith('http')) {
        return decoded;
      }
    } catch (e) {
      // Not a valid base64 string, so use it as is.
    }
    return channel.streamUrl;
  }, [channel]);

  // Set and unset the player actions ref in the context
  useEffect(() => {
    if (videoPlayerRef) {
        setPlayerActionsRef(videoPlayerRef);
    }
    return () => {
      setPlayerActionsRef(null);
    }
  }, [setPlayerActionsRef, videoPlayerRef]);

  useEffect(() => {
    if (channelId) {
      addRecentlyPlayed(channelId);
    }
  }, [channelId, addRecentlyPlayed]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement || !!(document as any).webkitIsFullScreen;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && screen.orientation && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleIframeFullscreen = useCallback(() => {
    const elem = iframeRef.current;
    if (!elem) return;

    if (!document.fullscreenElement && !(document as any).webkitIsFullScreen) {
        const promise = elem.requestFullscreen ? elem.requestFullscreen()
          : (elem as any).webkitRequestFullscreen ? (elem as any).webkitRequestFullscreen()
          : null;
        
        if (promise) promise.catch(err => {});

        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          try {
            screen.orientation.lock('landscape').catch(() => {});
          } catch(e) {}
        }
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    }
  }, []);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleBack = useCallback(() => {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(e => console.error("Error exiting PiP on back navigation", e));
    }
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    handleNavigation('/');
  }, [handleNavigation]);
  
  useEffect(() => {
    if (!channel) {
      router.replace('/');
    }
  }, [channel, router]);

  const handleGoHome = useCallback(() => {
    const video = playerActionsRef?.current?.getVideoElement();
    if (video && !video.paused) {
        if (playerActionsRef?.current && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
            playerActionsRef.current.requestPictureInPicture().catch(error => {
                console.error("Failed to enter PiP mode automatically:", error);
            });
        }
    }
    router.push('/');
  }, [router, playerActionsRef]);

  const switchChannel = useCallback((direction: 'next' | 'prev') => {
    if (!channel) return;
    const listType = searchParams.get('list') ? 'list' : searchParams.get('category') ? 'category' : 'list';
    const listValue = searchParams.get('list') || searchParams.get('category') || 'all';

    let currentChannelList: Channel[];
    if (listType === 'category') {
        currentChannelList = getChannels(listValue);
    } else {
        currentChannelList = getChannels();
    }
    
    const currentIndex = currentChannelList.findIndex(c => c.id === channelId);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % currentChannelList.length;
    } else { // 'prev'
      nextIndex = (currentIndex - 1 + currentChannelList.length) % currentChannelList.length;
    }
    
    const nextChannel = currentChannelList[nextIndex];
    if (nextChannel) {
      router.push(`/watch/${nextChannel.id}?${listType}=${listValue}`);
    }
  }, [channel, channelId, router, searchParams]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (channel?.type === 'iframe') return;
    switchChannel(direction === 'left' ? 'next' : 'prev');
  };

  if (!channel) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  const relatedChannels = getChannels(channel.category).filter(c => c.id !== channelId).slice(0, 7);

  return (
    <div className="flex h-screen flex-col bg-black">
       <div className="relative aspect-video w-full bg-black">
         {channel.type === 'iframe' ? (
           <>
             <iframe
               ref={iframeRef}
               src={decodedStreamUrl}
               className="h-full w-full border-0"
               allow="autoplay; encrypted-media; fullscreen"
               allowFullScreen
               sandbox="allow-forms allow-presentation allow-same-origin allow-scripts"
             ></iframe>
             <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={handleBack}>
                   <ArrowLeft />
                </Button>
                <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={toggleIframeFullscreen}>
                   {isFullscreen ? <Minimize /> : <Maximize />}
                </Button>
             </div>
           </>
         ) : (
           <VideoPlayer ref={videoPlayerRef} src={channel.streamUrl} type={channel.type} onSwipe={handleSwipe} onBack={handleBack} channel={channel} />
         )}
       </div>
       <div className="flex-1 overflow-y-auto bg-background p-4 pb-20 md:pb-4">
        <div className="container mx-auto max-w-4xl">
            <div className="flex items-start justify-between gap-4">
                <Image
                    src={channel.logoUrl}
                    alt={`Logo for ${channel.name}`}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg border bg-card object-contain p-1"
                    data-ai-hint={channel.logoImageHint}
                />
                <div>
                    <h1 className="font-headline text-3xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">{channel.name}</h1>
                    <p className="text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">{channel.category}</p>
                </div>
                <FavoriteToggleButton channelId={channel.id} channelName={channel.name} className="h-12 w-12 shrink-0"/>
            </div>
            <div className="mt-4 prose prose-invert max-w-none">
                {channel.type === 'iframe' ? (
                  <p>You are watching {channel.name}. Player controls are provided by the embedded stream. Some features like Picture-in-Picture or swiping to change channels may not be available.</p>
                ) : (
                  <p>You are watching {channel.name}. Swipe left or right on the player to switch channels.</p>
                )}
            </div>
            
            {relatedChannels.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 font-headline text-2xl font-bold text-primary">Related Channels</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                  {relatedChannels.map(relatedChannel => (
                    <Link
                      key={relatedChannel.id}
                      href={`/watch/${relatedChannel.id}?category=${channel.category}`}
                      className="group block w-24 flex-shrink-0 text-center"
                      title={relatedChannel.name}
                    >
                      <Image
                        src={relatedChannel.logoUrl}
                        alt={relatedChannel.name}
                        width={80}
                        height={80}
                        className="mx-auto h-20 w-20 rounded-full border-2 border-primary bg-card object-contain p-1 transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20"
                        data-ai-hint={relatedChannel.logoImageHint}
                      />
                       <p className="mt-2 w-full truncate text-sm text-muted-foreground">{relatedChannel.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {channel.type === 'iframe' && (
              <div className="absolute inset-x-0 bottom-1/2 flex translate-y-1/2 items-center justify-between px-2">
                <Button variant="ghost" size="icon" onClick={() => switchChannel('prev')} className="h-16 w-16 rounded-full bg-accent/20 backdrop-blur-md transition-all hover:bg-accent/40 hover:scale-110">
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => switchChannel('next')} className="h-16 w-16 rounded-full bg-accent/20 backdrop-blur-md transition-all hover:bg-accent/40 hover:scale-110">
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>
            )}
            
            <div className="mt-8">
                <Button variant="outline" size="lg" className="h-auto w-full border-2 border-primary text-2xl font-bold text-primary" onClick={handleGoHome}>
                    <Home className="mr-3 h-8 w-8" />
                    Home
                </Button>
            </div>
        </div>
       </div>
       <BottomNav />
    </div>
  );
}
    
