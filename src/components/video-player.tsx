'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoPlayerProps {
  src: string;
  type: 'hls' | 'mp4';
  onSwipe: (direction: 'left' | 'right') => void;
}

export function VideoPlayer({ src, type, onSwipe }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Dynamically import hls.js only on the client-side
    if (type === 'hls' && video.canPlayType('application/vnd.apple.mpegurl') === '') {
      import('hls.js').then(Hls => {
        if (Hls.default.isSupported()) {
          const hls = new Hls.default();
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.default.Events.MANIFEST_PARSED, () => {
             setIsLoading(false);
             video.play().catch(console.error);
          });
           hls.on(Hls.default.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('Fatal HLS error:', data);
            }
          });
        }
      });
    } else {
        video.src = src;
        video.play().catch(console.error);
    }
    
    return () => {
        // Cleanup if hls instance was created
    }

  }, [src, type]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    resetControlsTimeout();
    playerRef.current?.addEventListener('mousemove', resetControlsTimeout);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      
      playerRef.current?.removeEventListener('mousemove', resetControlsTimeout);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    resetControlsTimeout();
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 50) { // Min swipe distance
      onSwipe(swipeDistance > 0 ? 'left' : 'right');
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const togglePlay = () => {
    if (videoRef.current?.paused) videoRef.current?.play();
    else videoRef.current?.pause();
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if(videoRef.current) videoRef.current.muted = !isMuted;
    resetControlsTimeout();
  };

  const handleVolumeChange = (value: number[]) => {
    if(videoRef.current) {
        videoRef.current.volume = value[0];
        videoRef.current.muted = value[0] === 0;
    }
    resetControlsTimeout();
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        playerRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
    resetControlsTimeout();
  };
  
  const togglePiP = () => {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else {
        videoRef.current?.requestPictureInPicture().catch(console.error);
    }
    resetControlsTimeout();
  };

  return (
    <div
      ref={playerRef}
      className="group relative w-full aspect-video bg-black text-white"
      onClick={() => setShowControls(s => !s)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video ref={videoRef} className="h-full w-full" playsInline />
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Skeleton className="h-full w-full" />
                <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
            </div>
        )}

      <div className={cn("absolute inset-0 flex flex-col justify-between bg-black/30 transition-opacity", showControls ? 'opacity-100' : 'opacity-0')}>
        {/* Top Controls (placeholder) */}
        <div></div>
        
        {/* Middle Controls */}
        <div className="flex items-center justify-center">
          <Button variant="ghost" size="icon" onClick={togglePlay} className="h-16 w-16">
            {isPlaying ? <Pause size={48} /> : <Play size={48} />}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="p-4">
            {/* Progress bar would go here */}

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <div className="flex w-24 items-center">
                        <Slider value={[isMuted ? 0 : volume]} onValueChange={handleVolumeChange} max={1} step={0.1} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {document.pictureInPictureEnabled && (
                        <Button variant="ghost" size="icon" onClick={togglePiP}>
                            <PictureInPicture2 />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize /> : <Maximize />}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
