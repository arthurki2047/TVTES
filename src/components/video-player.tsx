'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const playVideo = (video: HTMLVideoElement) => {
    video.play().catch(error => {
      // Ignore AbortError which can happen when a new video is loaded while the previous one is trying to play.
      if (error.name !== 'AbortError') {
        console.error("Video play failed:", error);
      }
    });
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;
    setIsLoading(true);

    if (type === 'hls') {
        // Native playback for Safari and other supporting browsers
        if(video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', () => playVideo(video));
        } else if (typeof window !== 'undefined') {
            // Use hls.js for other browsers
            import('hls.js').then(Hls => {
                if (Hls.default.isSupported()) {
                  const hls = new Hls.default({
                    // Start loading from a position near the live edge
                    liveSyncDurationCount: 3, 
                    // Lower the max buffer length to reduce memory usage
                    maxMaxBufferLength: 30,
                  });
                  hlsInstance = hls;
                  hls.loadSource(src);
                  hls.attachMedia(video);
                  hls.on(Hls.default.Events.MANIFEST_PARSED, () => {
                     playVideo(video);
                  });
                   hls.on(Hls.default.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                      console.error('Fatal HLS error:', data);
                       // Attempt to recover from network errors
                      if (data.type === Hls.default.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                      }
                    }
                  });
                }
            });
        }
    } else {
        video.src = src;
        playVideo(video);
    }
    
    return () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        if (video) {
            video.removeEventListener('loadedmetadata', () => playVideo(video));
        }
    }

  }, [src, type]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if(videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      if (!video) return;
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const handleTimeUpdate = () => video && setProgress(video.currentTime);
    const handleDurationChange = () => video && setDuration(video.duration);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      resetControlsTimeout();
    };
    
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitIsFullScreen);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    const player = playerRef.current;
    
    player?.addEventListener('mousemove', resetControlsTimeout);
    player?.addEventListener('mouseleave', () => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if(isPlaying) setShowControls(false);
    });

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);


    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      
      player?.removeEventListener('mousemove', resetControlsTimeout);
      player?.removeEventListener('mouseleave', () => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if(isPlaying) setShowControls(false);
      });

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);

      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Only handle swipes on the video element itself, not on controls
    if ((e.target as HTMLElement).closest('.video-controls-container')) return;
    resetControlsTimeout();
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.video-controls-container')) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0) return;
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 50) { // Min swipe distance
      onSwipe(swipeDistance > 0 ? 'left' : 'right');
    } else {
        // It's a tap, not a swipe
        setShowControls(s => !s);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current?.paused) {
      playVideo(videoRef.current);
    } else {
      videoRef.current?.pause();
    }
    resetControlsTimeout();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const player = playerRef.current;
    if (!player) return;

    if (!document.fullscreenElement && !(document as any).webkitIsFullScreen) {
        if (player.requestFullscreen) {
            player.requestFullscreen().catch(err => console.error(`FS Error: ${err.message}`));
        } else if ((player as any).webkitRequestFullscreen) { /* Safari */
            (player as any).webkitRequestFullscreen();
        } else if ((player as any).msRequestFullscreen) { /* IE11 */
            (player as any).msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) { /* Safari */
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) { /* IE11 */
            (document as any).msExitFullscreen();
        }
    }
    resetControlsTimeout();
  };
  
  const togglePiP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else {
        videoRef.current?.requestPictureInPicture().catch(console.error);
    }
    resetControlsTimeout();
  };

  const handleNextChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipe('left');
    resetControlsTimeout();
  }

  const handlePrevChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipe('right');
    resetControlsTimeout();
  }


  return (
    <div
      ref={playerRef}
      className="group relative w-full aspect-video bg-black text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={resetControlsTimeout}
    >
      <video ref={videoRef} className="h-full w-full" playsInline onClick={() => setShowControls(s => !s)} />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn("video-controls-container absolute inset-0 flex flex-col justify-between bg-black/30 transition-opacity", showControls ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        
        {/* Top Controls (placeholder) */}
        <div></div>
        
        {/* Middle Controls */}
        <div className="flex items-center justify-around px-4 md:px-16">
          <Button variant="ghost" size="icon" onClick={handlePrevChannel} className="h-16 w-16">
            <ChevronLeft size={48} />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePlay} className="h-16 w-16">
            {isPlaying ? <Pause size={48} /> : <Play size={48} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextChannel} className="h-16 w-16">
            <ChevronRight size={48} />
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="p-4">
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
                    {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
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
