'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  type: 'hls' | 'mp4';
  onSwipe: (direction: 'left' | 'right') => void;
  onBack: () => void;
}

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds === Infinity || seconds < 0) {
        return '00:00';
    }
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
        return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
}


export function VideoPlayer({ src, type, onSwipe, onBack }: VideoPlayerProps) {
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
      if (error.name !== 'AbortError') {
        // console.error("Video play failed:", error);
      }
    });
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;
    setIsLoading(true);

    if (type === 'hls') {
        if(video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', () => playVideo(video));
        } else if (typeof window !== 'undefined') {
            import('hls.js').then(Hls => {
                if (Hls.default.isSupported()) {
                  const hls = new Hls.default({
                    liveSyncDurationCount: 3, 
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
                      // console.error('Fatal HLS error:', data);
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
        const isCurrentlyFullscreen = !!document.fullscreenElement || !!(document as any).webkitIsFullScreen;
        setIsFullscreen(isCurrentlyFullscreen);
        if (!isCurrentlyFullscreen) {
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                screen.orientation.unlock();
            }
        }
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
    resetControlsTimeout();
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0) return;
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 50) {
      onSwipe(swipeDistance > 0 ? 'left' : 'right');
    } else {
        setShowControls(s => !s);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };
  
  const toggleControls = () => {
    setShowControls(s => !s);
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
        } else if ((player as any).webkitRequestFullscreen) {
            (player as any).webkitRequestFullscreen();
        } else if ((player as any).msRequestFullscreen) {
            (player as any).msRequestFullscreen();
        }
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          screen.orientation.lock('landscape').catch(() => {});
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          screen.orientation.unlock();
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
  
  const isLive = duration === Infinity;


  return (
    <div
      ref={playerRef}
      className="group relative w-full aspect-video bg-black text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={resetControlsTimeout}
    >
      <video ref={videoRef} className="h-full w-full" playsInline onClick={toggleControls} />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
        </div>
      )}

      <div
        onClick={toggleControls}
        className={cn("video-controls-container absolute inset-0 flex flex-col justify-between transition-opacity", showControls ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/20 to-black/60" />

        <div className="flex justify-between items-center p-2 md:p-4" onClick={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onBack}>
                <ArrowLeft />
            </Button>
        </div>
        
        <div className="flex items-center justify-center gap-8 md:gap-16" onClick={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={handlePrevChannel} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
            <ChevronLeft size={40} />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePlay} className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
            {isPlaying ? <Pause size={56} /> : <Play size={56} className="ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextChannel} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
            <ChevronRight size={40} />
          </Button>
        </div>

        <div className="pt-8 pb-2 md:pb-4" onClick={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
            {!isLive && duration > 0 && (
                <div className="px-4 md:px-6 mb-2">
                    <Slider
                        value={[progress]}
                        max={duration}
                        onValueChange={(value) => {
                            if (videoRef.current) videoRef.current.currentTime = value[0];
                        }}
                        className="w-full [&>span:first-child]:bg-primary"
                    />
                    <div className="flex justify-between text-xs font-mono text-white/80 mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between gap-4 px-2 md:px-4">
                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <div className="hidden md:flex w-24 items-center">
                        <Slider value={[isMuted ? 0 : volume]} onValueChange={handleVolumeChange} max={1} step={0.1} />
                    </div>
                     {isLive && (
                        <div className="flex items-center gap-1.5 ml-2">
                            <div className="relative flex h-2.5 w-2.5">
                                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                                <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></div>
                            </div>
                            <span className="text-sm font-medium uppercase text-red-400 tracking-wider">Live</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                        <Button variant="ghost" size="icon" onClick={togglePiP} className="text-white hover:bg-white/20">
                            <PictureInPicture2 />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                        {isFullscreen ? <Minimize /> : <Maximize />}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
