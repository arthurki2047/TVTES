'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, ChevronLeft, ChevronRight, ArrowLeft, Lock, Unlock, Settings, RotateCcw, RotateCw, Crop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Channel } from '@/lib/types';
import { useVideoPlayer } from '@/context/video-player-context';

interface VideoPlayerProps {
  src: string;
  type: 'hls' | 'mp4';
  onSwipe: (direction: 'left' | 'right') => void;
  onBack: () => void;
  channel: Channel;
}

export interface VideoPlayerHandles {
  requestPictureInPicture: () => Promise<void>;
  getVideoElement: () => HTMLVideoElement | null;
  requestFullscreen: () => void;
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

type FitMode = 'contain' | 'cover' | 'fill';

export const VideoPlayer = forwardRef<VideoPlayerHandles, VideoPlayerProps>(({ src, type, onSwipe, onBack, channel }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const { setPlayerRef, setPipPlayerRef, isMuted, toggleMute: contextToggleMute, setPipChannelId } = useVideoPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const previousVolume = useRef(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isManifestLive, setIsManifestLive] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>('contain');

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  
  const resetControlsTimeout = useCallback(() => {
    if (isLocked) return;
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 5000);
  }, [isLocked]);
  
  const playVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(error => {
        if (error.name !== 'AbortError') {
          console.error("Video play failed:", error);
        }
      });
    }
  },[]);
  
  useEffect(() => {
    setIsClient(true);
    setPlayerRef(videoRef);
    return () => {
      // Don't clear the ref if we are in PiP mode, so the context can still control it.
      if (document.pictureInPictureElement !== videoRef.current) {
        setPlayerRef(null);
      }
    };
  }, [setPlayerRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setPipPlayerRef(videoRef);
       if (video.dataset.channelId && setPipChannelId) {
        setPipChannelId(video.dataset.channelId);
      }
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);

    return () => {
      if (video) {
        video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      }
    };
  }, [setPipPlayerRef, setPipChannelId]);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Don't re-initialize if it's the video in PiP
    if (document.pictureInPictureElement === video) {
      return;
    }

    setQualityLevels([]);
    setCurrentQuality(-1);
    setIsManifestLive(false);
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }
    video.pause();
    video.removeAttribute('src');
    video.load();

    if (type === 'hls') {
        import('hls.js').then(Hls => {
            if (Hls.default.isSupported()) {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                }
                const hls = new Hls.default({
                    liveSyncDurationCount: 3, 
                    maxMaxBufferLength: 30,
                    liveDurationInfinity: true,
                });
                hlsRef.current = hls;
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(Hls.default.Events.MANIFEST_PARSED, (event, data) => {
                     if (data.details) {
                        const isStreamLive = data.details.live || data.details.type?.toUpperCase() === 'LIVE';
                        setIsManifestLive(isStreamLive);
                     }
                     playVideo(video);
                     if (hls.levels && hls.levels.length > 1) {
                        setQualityLevels(hls.levels);
                     }
                });
                hls.on(Hls.default.Events.LEVEL_SWITCHED, (event, data) => {
                    setCurrentQuality(data.level)
                });
                hls.on(Hls.default.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error(`HLS.js fatal error: ${data.type} - ${data.details}`);
                        switch (data.type) {
                            case Hls.default.ErrorTypes.NETWORK_ERROR:
                                // Try to recover on network errors
                                console.log('Fatal network error encountered, trying to recover...');
                                hls.startLoad();
                                break;
                            case Hls.default.ErrorTypes.MEDIA_ERROR:
                                console.log('Fatal media error encountered, trying to recover...');
                                hls.recoverMediaError();
                                break;
                            default:
                                // Cannot recover
                                console.log('Unrecoverable HLS error, destroying instance.');
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Fallback to native HLS support if hls.js is not supported
                video.src = src;
                playVideo(video);
            }
        });
    } else if (type === 'mp4') {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        video.src = src;
        playVideo(video);
    }
    
    return () => {
        if (video && document.pictureInPictureElement === video) {
            return;
        }

        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
    }

  }, [src, type, playVideo]);

  const isLive = duration === Infinity || isManifestLive;

  const handleSeek = useCallback((amount: number) => {
    if (videoRef.current && !isLive) {
        const newTime = videoRef.current.currentTime + amount;
        videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
    }
    resetControlsTimeout();
  }, [resetControlsTimeout, isLive, duration]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel || !('mediaSession' in navigator)) {
      return;
    }

    const mediaSessionPlay = () => {
      if (video.paused) {
        playVideo(video);
      }
    };

    const mediaSessionPause = () => {
      if (!video.paused) {
        video.pause();
      }
    };
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: channel.name,
      artist: channel.category,
      artwork: [
        { src: channel.logoUrl, sizes: '96x96' },
        { src: channel.logoUrl, sizes: '128x128' },
        { src: channel.logoUrl, sizes: '192x192' },
        { src: channel.logoUrl, sizes: '256x256' },
        { src: channel.logoUrl, sizes: '384x384' },
        { src: channel.logoUrl, sizes: '512x512' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', mediaSessionPlay);
    navigator.mediaSession.setActionHandler('pause', mediaSessionPause);
    navigator.mediaSession.setActionHandler('nexttrack', () => onSwipe('left'));
    navigator.mediaSession.setActionHandler('previoustrack', () => onSwipe('right'));
    if (!isLive) {
      navigator.mediaSession.setActionHandler('seekforward', (details) => handleSeek(details.seekOffset || 30));
      navigator.mediaSession.setActionHandler('seekbackward', (details) => handleSeek(-(details.seekOffset || 30)));
    } else {
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
    }
    
    const handlePlay = () => {
      navigator.mediaSession.playbackState = 'playing';
    };
    const handlePause = () => {
      navigator.mediaSession.playbackState = 'paused';
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (video.paused) {
      handlePause();
    } else {
      handlePlay();
    }

    return () => {
      if ('mediaSession' in navigator) {
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.setActionHandler('seekforward', null);
          navigator.mediaSession.setActionHandler('seekbackward', null);
          navigator.mediaSession.playbackState = 'none';
      }
    };
  }, [channel, onSwipe, playVideo, isLive, handleSeek]);

  const resetUnlockTimeout = useCallback(() => {
    if (unlockTimeoutRef.current) {
      clearTimeout(unlockTimeoutRef.current);
    }
    setShowUnlock(true);
    unlockTimeoutRef.current = setTimeout(() => {
      setShowUnlock(false);
    }, 5000);
  }, []);
  
  const toggleControls = useCallback(() => {
    if (isLocked) return;
    setShowControls(s => {
      const nextState = !s;
      if (nextState) {
        resetControlsTimeout();
      } else {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }
      return nextState;
    });
  }, [resetControlsTimeout, isLocked]);

  const handleTap = () => {
    if (isLocked) {
        resetUnlockTimeout();
    } else {
        toggleControls();
    }
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current?.paused) {
      playVideo(videoRef.current);
    } else {
      videoRef.current?.pause();
    }
    resetControlsTimeout();
  }, [resetControlsTimeout, playVideo]);

  const handleVolumeChange = useCallback((newVolume: number[]) => {
      const value = newVolume[0];
      setVolume(value);
      if (videoRef.current) {
        videoRef.current.volume = value;
        videoRef.current.muted = value === 0;
      }
      resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      contextToggleMute();
      resetControlsTimeout();
  }, [contextToggleMute, resetControlsTimeout]);

  useEffect(() => {
    if (isMuted) {
      if (volume > 0) {
        previousVolume.current = volume;
      }
      setVolume(0);
    } else {
      if (volume === 0) {
        setVolume(previousVolume.current);
      }
    }
  }, [isMuted, volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        video.volume = volume;
    }
  }, [volume]);
  
  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = playerRef.current;
    if (!player) return;

    if (!document.fullscreenElement && !(document as any).webkitIsFullScreen) {
        if (player.requestFullscreen) {
            player.requestFullscreen().catch(err => {});
        } else if ((player as any).webkitRequestFullscreen) {
            (player as any).webkitRequestFullscreen();
        } else if ((player as any).msRequestFullscreen) {
            (player as any).msRequestFullscreen();
        }
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          try {
            screen.orientation.lock('landscape').catch(() => {});
          } catch(e) {}
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
  }, [resetControlsTimeout]);

  const toggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeLocked = !isLocked;
    setIsLocked(willBeLocked);

    if (willBeLocked) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(false);
      resetUnlockTimeout();
    } else {
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      setShowUnlock(false);
      resetControlsTimeout();
    }
  }, [isLocked, resetControlsTimeout, resetUnlockTimeout]);
  
  const enterPiP = useCallback(async () => {
    if (videoRef.current && document.pictureInPictureEnabled && !videoRef.current.disablePictureInPicture) {
       if (!document.pictureInPictureElement) {
           await videoRef.current.requestPictureInPicture();
       }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    requestPictureInPicture: enterPiP,
    getVideoElement: () => videoRef.current,
    requestFullscreen: () => toggleFullscreen(),
  }));

  const togglePiP = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else {
        videoRef.current?.requestPictureInPicture().catch(console.error);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleNextChannel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipe('left');
    resetControlsTimeout();
  }, [onSwipe, resetControlsTimeout]);

  const handlePrevChannel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipe('right');
    resetControlsTimeout();
  }, [onSwipe, resetControlsTimeout]);

  const handleQualityChange = useCallback((levelIndex: number) => {
    if (hlsRef.current) {
        hlsRef.current.currentLevel = levelIndex;
        setCurrentQuality(levelIndex);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleFitModeChange = useCallback((mode: FitMode) => {
    setFitMode(mode);
    resetControlsTimeout();
  }, [resetControlsTimeout]);
  
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video || !player) return;

    // Wake Lock logic
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err: any) {
          // NotAllowedError can happen if the document is not visible,
          // or if the user has not granted permission. We can ignore it.
          if (err.name !== 'NotAllowedError') {
            console.error('Could not acquire wake lock:', err);
          }
        }
      }
    };
    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        } catch(e) {
            // This can happen if the lock was already released.
        }
      }
    };

    const handlePlay = () => {
        setIsPlaying(true);
        requestWakeLock();
    };
    const handlePause = () => {
        setIsPlaying(false);
        releaseWakeLock();
    };

    const handleTimeUpdate = () => video && setProgress(video.currentTime);
    const handleDurationChange = () => video && setDuration(video.duration);
    const handleWaiting = () => {};
    const handlePlaying = () => {
      resetControlsTimeout();
    };
    
    const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement || !!(document as any).webkitIsFullScreen;
        setIsFullscreen(isCurrentlyFullscreen);
        if (!isCurrentlyFullscreen) {
            setIsLocked(false);
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                screen.orientation.unlock();
            }
        }
    };
    
    const handleMouseLeave = () => {
      if (isLocked) return;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    
    player.addEventListener('mousemove', resetControlsTimeout);
    player.addEventListener('mouseleave', handleMouseLeave);
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video && !video.paused) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      
      player.removeEventListener('mousemove', resetControlsTimeout);
      player.removeEventListener('mouseleave', handleMouseLeave);

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();

      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
    };
  }, [resetControlsTimeout, isLocked]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="slider"], [data-radix-popper-content-wrapper]')) {
        touchStartX.current = 0;
        touchEndX.current = 0;
        return;
    }
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="slider"], [data-radix-popper-content-wrapper]')) {
      return;
    }
    
    const xDiff = touchStartX.current - touchEndX.current;
    const yDiff = touchStartY.current - touchEndY.current;
    
    const isSwipe = touchEndX.current !== 0 && Math.abs(xDiff) > 50 && Math.abs(xDiff) > Math.abs(yDiff);

    if (!isLocked && isSwipe) {
      onSwipe(xDiff > 0 ? 'left' : 'right');
    } else if (!isSwipe && touchStartX.current !== 0) {
      handleTap();
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const uniqueQualityLevels = React.useMemo(() => {
    if (qualityLevels.length === 0) return [];
    // hls.js provides levels sorted by bitrate ascending. We want to show highest quality first.
    const reversedLevels = [...qualityLevels].reverse();
    // Get unique levels by height, preferring the one with higher bitrate (which comes first in reversedLevels)
    const uniqueByHeight = reversedLevels.filter((level, index, self) =>
      index === self.findIndex((l) => l.height === level.height)
    );
    return uniqueByHeight;
  }, [qualityLevels]);

  return (
    <div
      ref={playerRef}
      className="group relative w-full aspect-video bg-black text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={resetControlsTimeout}
    >
      <video
        ref={videoRef}
        className={cn(
          "h-full w-full",
          {
            'object-contain': fitMode === 'contain',
            'object-cover': fitMode === 'cover',
            'object-fill': fitMode === 'fill',
          }
        )}
        playsInline
        onClick={handleTap}
        data-channel-id={channel.id}
      />
      
      {isLocked && isFullscreen && showUnlock && (
         <div className="absolute inset-0 z-20 flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={toggleLock} className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-sm text-white transition-all hover:bg-white/20 hover:scale-110">
                <Unlock size={48} />
            </Button>
        </div>
      )}

      <div
        className={cn("video-controls-container absolute inset-0 flex flex-col justify-between transition-opacity", (showControls && !isLocked) ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/60" />

        <div className="p-2 md:p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={(e) => { e.stopPropagation(); onBack(); }}>
                <ArrowLeft />
            </Button>
            {isFullscreen && (
                <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={toggleLock}>
                    <Lock />
                </Button>
            )}
        </div>
        
        <div className="flex-1 flex items-center justify-between px-4 md:px-8" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={handlePrevChannel} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
            <ChevronLeft size={40} />
          </Button>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            {!isLive && (
                <Button variant="ghost" size="icon" onClick={() => handleSeek(-30)} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
                    <RotateCcw size={32} />
                </Button>
            )}

            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
              {isPlaying ? <Pause size={56} /> : <Play size={56} className="ml-1" />}
            </Button>
            
            {!isLive && (
                <Button variant="ghost" size="icon" onClick={() => handleSeek(30)} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
                    <RotateCw size={32} />
                </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={handleNextChannel} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
            <ChevronRight size={40} />
          </Button>
        </div>

        <div className="pt-8 pb-2 md:pb-4" onClick={e => e.stopPropagation()}>
            {!isLive && duration > 0 && (
                <div className="px-4 md:px-6 mb-2">
                    <Slider
                        value={[progress]}
                        max={duration}
                        onValueChange={(value) => {
                            if (videoRef.current) videoRef.current.currentTime = value[0];
                        }}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs font-mono text-white/80 mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between gap-4 px-2 md:px-4">
                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <div className="hidden md:flex w-24 items-center">
                        <Slider value={[volume]} onValueChange={handleVolumeChange} max={1} step={0.1} />
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
                    {uniqueQualityLevels.length > 1 && type === 'hls' && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 bg-black/70 backdrop-blur-sm border-white/20 text-white p-2 mb-2">
                                <div className="grid gap-1">
                                    <div
                                        key={-1}
                                        onClick={() => handleQualityChange(-1)}
                                        className={cn(
                                            "p-2 text-sm rounded-md cursor-pointer hover:bg-white/10",
                                            currentQuality === -1 && "bg-primary text-primary-foreground hover:bg-primary/90"
                                        )}
                                    >
                                        Auto
                                    </div>
                                    {uniqueQualityLevels.map((level, i) => (
                                        <div
                                            key={level.height || i}
                                            onClick={() => handleQualityChange(qualityLevels.indexOf(level))}
                                            className={cn(
                                                "p-2 text-sm rounded-md cursor-pointer hover:bg-white/10",
                                                currentQuality === qualityLevels.indexOf(level) && "bg-primary text-primary-foreground hover:bg-primary/90"
                                            )}
                                        >
                                            {level.height}p
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {isFullscreen && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Crop />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 bg-black/70 backdrop-blur-sm border-white/20 text-white p-2 mb-2">
                                <div className="grid gap-1">
                                    <div
                                        onClick={() => handleFitModeChange('contain')}
                                        className={cn(
                                            "p-2 text-sm rounded-md cursor-pointer hover:bg-white/10",
                                            fitMode === 'contain' && "bg-primary text-primary-foreground hover:bg-primary/90"
                                        )}
                                    >
                                        Original
                                    </div>
                                    <div
                                        onClick={() => handleFitModeChange('cover')}
                                        className={cn(
                                            "p-2 text-sm rounded-md cursor-pointer hover:bg-white/10",
                                            fitMode === 'cover' && "bg-primary text-primary-foreground hover:bg-primary/90"
                                        )}
                                    >
                                        Fit to Screen
                                    </div>
                                    <div
                                        onClick={() => handleFitModeChange('fill')}
                                        className={cn(
                                            "p-2 text-sm rounded-md cursor-pointer hover:bg-white/10",
                                            fitMode === 'fill' && "bg-primary text-primary-foreground hover:bg-primary/90"
                                        )}
                                    >
                                        Stretch
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {isClient && document.pictureInPictureEnabled && (
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
});

VideoPlayer.displayName = 'VideoPlayer';
