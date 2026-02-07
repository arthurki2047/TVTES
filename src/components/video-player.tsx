
'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLeft, ChevronRight, ArrowLeft, Lock, Unlock, Settings, RotateCcw, RotateCw, Crop, PictureInPicture2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Channel } from '@/lib/types';
import { useVideoPlayer, type VideoPlayerActions } from '@/context/video-player-context';

interface VideoPlayerProps {
  src: string;
  type: 'hls' | 'mp4';
  onSwipe: (direction: 'left' | 'right') => void;
  onBack: () => void;
  channel: Channel;
}

export interface VideoPlayerHandles extends VideoPlayerActions {
}

function formatTime(seconds: number) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
        return '00:00';
    }
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMins();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
        return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
}

type FitMode = 'contain' | 'cover' | 'fill';

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second base

/**
 * A robust, responsive video player component for HLS and MP4 streams.
 * It features auto-loading, muted autoplay, error recovery, and a full suite of UI controls.
 */
export const VideoPlayer = forwardRef<VideoPlayerHandles, VideoPlayerProps>(({ src, type, onSwipe, onBack, channel }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const { setPlayerRef, isMuted, toggleMute: contextToggleMute } = useVideoPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const previousVolume = useRef(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
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
  const [playerError, setPlayerError] = useState<string | null>(null);
  const pathname = usePathname();
  
  // Smart Reload states
  const [retryVersion, setRetryVersion] = useState(0);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const isLive = useMemo(() => duration === Infinity || isManifestLive, [duration, isManifestLive]);

  const decodedSrc = useMemo(() => {
    if (!src) return '';
    try {
      const decoded = atob(src);
      if (decoded.startsWith('http')) {
        return decoded;
      }
    } catch (e) {
      // Not a valid base64 string, so use it as is.
    }
    return src;
  }, [src]);
  
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
          setPlayerError('Playback was prevented by the browser. Please click the play button.');
        }
      });
    }
  },[]);
  
  const initializeHls = useCallback(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
    }
    
    setPlayerError(null);
    setQualityLevels([]);
    setCurrentQuality(-1);
    setIsManifestLive(false);

    if (type === 'hls') {
        import('hls.js').then(Hls => {
            if (Hls.default.isSupported()) {
                const hls = new Hls.default({});
                hlsRef.current = hls;

                hls.on(Hls.default.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch(data.type) {
                          case Hls.default.ErrorTypes.NETWORK_ERROR:
                             console.warn(`HLS.js fatal network error. Retry ${retryCountRef.current + 1}/${MAX_RETRIES}...`);
                            if (retryCountRef.current < MAX_RETRIES) {
                                const delay = RETRY_DELAY * Math.pow(2, retryCountRef.current);
                                retryCountRef.current++;
                                retryTimeoutRef.current = setTimeout(() => setRetryVersion(v => v + 1), delay);
                            } else {
                                console.error('HLS.js recovery failed after max retries.');
                                setPlayerError(`Stream failed to load after multiple retries. Please check your network.`);
                                hls.destroy();
                            }
                            break;
                          case Hls.default.ErrorTypes.MEDIA_ERROR:
                            console.warn('HLS.js fatal media error occurred, attempting to recover...');
                            hls.recoverMediaError();
                            break;
                          default:
                            setPlayerError(`A fatal error occurred. Details: ${data.details}.`);
                            hls.destroy();
                            break;
                        }
                    } else if (data.type === Hls.default.ErrorTypes.MEDIA_ERROR && data.details === 'bufferStalledError') {
                        const video = videoRef.current;
                        console.warn('HLS.js buffer stalled, attempting to recover.');
                        const liveSyncPosition = hls.liveSyncPosition;
                        if (liveSyncPosition && isFinite(liveSyncPosition) && video) {
                            console.log('Jumping to live edge to recover from stall.');
                            video.currentTime = liveSyncPosition;
                        } else {
                            console.log('Buffer stalled, but no live edge to jump to. Attempting to resume loading.');
                            hls.startLoad();
                        }
                    }
                });

                hls.on(Hls.default.Events.MANIFEST_PARSED, (event, data) => {
                     retryCountRef.current = 0; 
                     if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

                     if (data.details) {
                        const isStreamLive = data.details.live || data.details.type?.toUpperCase() === 'LIVE';
                        setIsManifestLive(isStreamLive);
                     }
                     setPlayerError(null);
                     playVideo(currentVideo);
                     if (hls.levels && hls.levels.length > 1) {
                        setQualityLevels(hls.levels);
                     }
                });

                hls.on(Hls.default.Events.LEVEL_SWITCHED, (event, data) => {
                    setCurrentQuality(data.level)
                });
                
                hls.loadSource(decodedSrc);
                hls.attachMedia(currentVideo);

            } else if (currentVideo.canPlayType('application/vnd.apple.mpegurl')) {
                currentVideo.src = decodedSrc;
                playVideo(currentVideo);
            }
        });
    } else if (type === 'mp4') {
        currentVideo.src = decodedSrc;
        playVideo(currentVideo);
    }
  }, [decodedSrc, type, playVideo]);

  useEffect(() => {
    setIsClient(true);
    setPlayerRef(videoRef);
    return () => {
      setPlayerRef(null);
    };
  }, [setPlayerRef]);

  useEffect(() => {
    initializeHls();
    const video = videoRef.current;
    
    return () => {
      if (video && document.pictureInPictureElement !== video) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [initializeHls, retryVersion]);
  
  const handleSeek = useCallback((amount: number) => {
    if (videoRef.current) {
        const newTime = videoRef.current.currentTime + amount;
        videoRef.current.currentTime = Math.max(0, Math.min(newTime, isLive ? videoRef.current.seekable.end(videoRef.current.seekable.length - 1) : duration));
    }
    resetControlsTimeout();
  }, [resetControlsTimeout, isLive, duration]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel || !('mediaSession' in navigator)) {
      return;
    }

    const mediaSessionPlay = () => video.paused && playVideo(video);
    const mediaSessionPause = () => !video.paused && video.pause();
    
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
    
    const handlePlaybackState = () => {
        navigator.mediaSession.playbackState = video.paused ? 'paused' : 'playing';
    };
    video.addEventListener('play', handlePlaybackState);
    video.addEventListener('pause', handlePlaybackState);
    handlePlaybackState();

    return () => {
        video.removeEventListener('play', handlePlaybackState);
        video.removeEventListener('pause', handlePlaybackState);
        if ('mediaSession' in navigator) {
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
  }, [channel, onSwipe, playVideo, handleSeek, isLive]);

  const resetUnlockTimeout = useCallback(() => {
    if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
    setShowUnlock(true);
    unlockTimeoutRef.current = setTimeout(() => setShowUnlock(false), 5000);
  }, []);
  
  const toggleControls = useCallback(() => {
    if (isLocked) return;
    setShowControls(s => {
      const nextState = !s;
      if (nextState) resetControlsTimeout();
      else if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      return nextState;
    });
  }, [resetControlsTimeout, isLocked]);

  const handleTap = () => {
    if (isLocked) resetUnlockTimeout();
    else toggleControls();
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current?.paused) playVideo(videoRef.current);
    else videoRef.current?.pause();
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
      if (volume > 0) previousVolume.current = volume;
      setVolume(0);
    } else if (volume === 0) {
      setVolume(previousVolume.current);
    }
  }, [isMuted, volume]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);
  
  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = playerRef.current;
    if (!player) return;

    if (!document.fullscreenElement && !(document as any).webkitIsFullScreen) {
        const promise = player.requestFullscreen ? player.requestFullscreen()
          : (player as any).webkitRequestFullscreen ? (player as any).webkitRequestFullscreen()
          : (player as any).msRequestFullscreen ? (player as any).msRequestFullscreen()
          : null;
        if (promise) promise.catch(err => {});
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          try { screen.orientation.lock('landscape').catch(() => {}); } catch(e) {}
        }
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
        if (screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock();
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

  const togglePictureInPicture = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!document.pictureInPictureEnabled) return;
    const video = videoRef.current;
    if (!video) return;

    try {
        if (document.pictureInPictureElement === video) {
            await document.exitPictureInPicture();
        } else {
            await video.requestPictureInPicture();
        }
    } catch (error) {
        console.error("PiP toggle failed:", error);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);
  
  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    requestFullscreen: () => toggleFullscreen(),
    requestPictureInPicture: async () => {
        const video = videoRef.current;
        if (video && document.pictureInPictureEnabled && document.pictureInPictureElement !== video) {
            await video.requestPictureInPicture();
        }
    },
  }));

  const handleNextChannel = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onSwipe('left'); resetControlsTimeout(); }, [onSwipe, resetControlsTimeout]);
  const handlePrevChannel = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onSwipe('right'); resetControlsTimeout(); }, [onSwipe, resetControlsTimeout]);
  const handleQualityChange = useCallback((levelIndex: number) => { if (hlsRef.current) { hlsRef.current.currentLevel = levelIndex; setCurrentQuality(levelIndex); } resetControlsTimeout(); }, [resetControlsTimeout]);
  const handleFitModeChange = useCallback((mode: FitMode) => { setFitMode(mode); resetControlsTimeout(); }, [resetControlsTimeout]);
  
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;
    if (!video || !player) return;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (err: any) {
          if (err.name !== 'NotAllowedError') console.error('Could not acquire wake lock:', err);
        }
      }
    };
    const releaseWakeLock = async () => { if (wakeLockRef.current) { try { await wakeLockRef.current.release(); wakeLockRef.current = null; } catch(e) {} } };

    const handlePlay = () => { setIsPlaying(true); requestWakeLock(); };
    const handlePause = () => { setIsPlaying(false); releaseWakeLock(); };
    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    
    const handleWaiting = () => {
      if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = setTimeout(() => {
        if (video && !video.paused) {
            console.warn("Video playback has stalled for over 10 seconds. Attempting recovery.");
            let recovered = false;
            if (isLive && hlsRef.current) {
                const liveSyncPosition = hlsRef.current.liveSyncPosition;
                if (liveSyncPosition && isFinite(liveSyncPosition)) {
                    console.log('Stall recovery: seeking to live edge.');
                    video.currentTime = liveSyncPosition;
                    playVideo(video);
                    recovered = true;
                }
            }
            if (!recovered) {
                console.log('Stall recovery: triggering a full reload.');
                setRetryVersion(v => v + 1);
            }
        }
      }, 10000); // 10 seconds
    };

    const handlePlaying = () => { 
        if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
        resetControlsTimeout();
    };
    
    const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement || !!(document as any).webkitIsFullScreen;
        setIsFullscreen(isCurrentlyFullscreen);
        if (!isCurrentlyFullscreen) {
            setIsLocked(false);
            if (screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock();
        }
    };
    
    const handleMouseLeave = () => { if (!isLocked && videoRef.current && !videoRef.current.paused) { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); setShowControls(false); } };

    const handleEnterPip = () => setIsPipActive(true);
    const handleLeavePip = () => {
        setIsPipActive(false);
        if (!pathname.startsWith('/watch/')) {
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
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('enterpictureinpicture', handleEnterPip);
    video.addEventListener('leavepictureinpicture', handleLeavePip);
    player.addEventListener('mousemove', resetControlsTimeout);
    player.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible' && !video.paused) requestWakeLock(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('enterpictureinpicture', handleEnterPip);
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
      player.removeEventListener('mousemove', resetControlsTimeout);
      player.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current);
    };
  }, [resetControlsTimeout, isLocked, playVideo, pathname, isLive]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="slider"], [data-radix-popper-content-wrapper]')) {
        touchStartX.current = 0; touchEndX.current = 0; return;
    }
    touchStartX.current = e.targetTouches[0].clientX; touchStartY.current = e.targetTouches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => { if (touchStartX.current === 0) return; touchEndX.current = e.targetTouches[0].clientX; touchEndY.current = e.targetTouches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="slider"], [data-radix-popper-content-wrapper]')) return;
    const xDiff = touchStartX.current - touchEndX.current; const yDiff = touchStartY.current - touchEndY.current;
    const isSwipe = touchEndX.current !== 0 && Math.abs(xDiff) > 50 && Math.abs(xDiff) > Math.abs(yDiff);
    if (!isLocked && isSwipe) onSwipe(xDiff > 0 ? 'left' : 'right');
    else if (!isSwipe && touchStartX.current !== 0) handleTap();
    touchStartX.current = 0; touchEndX.current = 0; touchStartY.current = 0; touchEndY.current = 0;
  };

  const uniqueQualityLevels = React.useMemo(() => {
    if (qualityLevels.length === 0) return [];
    const reversedLevels = [...qualityLevels].reverse();
    const uniqueByHeight = reversedLevels.filter((level, index, self) => index === self.findIndex((l) => l.height === level.height));
    return uniqueByHeight;
  }, [qualityLevels]);

  const isPipSupported = isClient && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;

  return (
    <div ref={playerRef} className="group relative w-full aspect-video bg-black text-white" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseMove={resetControlsTimeout}>
      {/* The native video element that will be controlled by React and hls.js */}
      <video ref={videoRef} className={cn("h-full w-full", { 'object-contain': fitMode === 'contain', 'object-cover': fitMode === 'cover', 'object-fill': fitMode === 'fill' })} playsInline autoPlay muted onClick={handleTap} data-channel-id={channel.id} />
      
      {/* UI for displaying fatal playback errors */}
      {playerError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-4 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold">Stream Error</h3>
            <p className="mt-2 text-muted-foreground">{playerError}</p>
        </div>
      )}

      {isLocked && isFullscreen && showUnlock && (
         <div className="absolute inset-0 z-20 flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={toggleLock} className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-sm text-white transition-all hover:bg-white/20 hover:scale-110"><Unlock size={48} /></Button>
        </div>
      )}
      
      {/* Container for all player controls. Visibility is toggled based on user interaction. */}
      <div className={cn("video-controls-container absolute inset-0 flex flex-col justify-between transition-opacity", (showControls && !isLocked) ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        {/* Gradient overlays to ensure control visibility against various video content */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/60" />

        {/* Top controls: Back button and Lock button (in fullscreen) */}
        <div className="p-2 md:p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={(e) => { e.stopPropagation(); onBack(); }}><ArrowLeft /></Button>
            {isFullscreen && (<Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={toggleLock}><Lock /></Button>)}
        </div>
        
        {/* Center controls: Channel switching and main Play/Pause button */}
        <div className="flex-1 flex items-center justify-between px-2 md:px-8" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={handlePrevChannel} className="h-16 w-16 rounded-full bg-black/25 backdrop-blur-sm transition-all hover:bg-black/40 hover:scale-105"><ChevronLeft size={40} /></Button>
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => handleSeek(-30)} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"><RotateCcw size={32} /></Button>
            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">{isPlaying ? <Pause size={56} /> : <Play size={56} className="ml-1" />}</Button>
            <Button variant="ghost" size="icon" onClick={() => handleSeek(30)} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"><RotateCw size={32} /></Button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextChannel} className="h-16 w-16 rounded-full bg-black/25 backdrop-blur-sm transition-all hover:bg-black/40 hover:scale-105"><ChevronRight size={40} /></Button>
        </div>

        {/* Bottom controls: Progress bar, volume, settings, and fullscreen */}
        <div className="pt-8 pb-2 md:pb-4" onClick={e => e.stopPropagation()}>
            {type === 'mp4' && !isLive ? (
                <div className="px-4 md:px-6 mb-2">
                    <Slider value={[progress]} max={duration} onValueChange={(value) => { if (videoRef.current) videoRef.current.currentTime = value[0]; }} className="w-full" />
                    <div className="flex justify-between text-xs font-mono text-white/80 mt-1">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                </div>
            ) : (
                <div className="px-4 md:px-6 mb-2 flex items-end" style={{ height: '34px' }}>
                    <div className="flex items-center gap-1.5">
                        <div className="relative flex h-2.5 w-2.5"><div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div><div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></div></div>
                        <span className="text-sm font-medium uppercase text-red-400 tracking-wider">Live</span>
                    </div>
                </div>
            )
            }
            <div className="flex items-center justify-between gap-4 px-2 md:px-4">
                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</Button>
                    <Button variant="ghost" size="icon" onClick={toggleMute}>{isMuted ? <VolumeX /> : <Volume2 />}</Button>
                    <div className="hidden md:flex w-24 items-center"><Slider value={[volume]} onValueChange={handleVolumeChange} max={1} step={0.1} /></div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    {uniqueQualityLevels.length > 1 && type === 'hls' && (
                        <Popover>
                            <PopoverTrigger asChild><Button variant="ghost" size="icon"><Settings /></Button></PopoverTrigger>
                            <PopoverContent container={playerRef.current} align="end" className="w-48 bg-black/70 backdrop-blur-sm border-white/20 text-white p-2 mb-2">
                                <div className="grid gap-1">
                                    <div key={-1} onClick={() => handleQualityChange(-1)} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-white/10", currentQuality === -1 && "bg-primary text-primary-foreground hover:bg-primary/90")}>Auto</div>
                                    {uniqueQualityLevels.map((level) => (<div key={level.height} onClick={() => handleQualityChange(qualityLevels.indexOf(level))} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-white/10", currentQuality === qualityLevels.indexOf(level) && "bg-primary text-primary-foreground hover:bg-primary/90")}>{level.height}p</div>))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {isFullscreen && (
                        <Popover>
                            <PopoverTrigger asChild><Button variant="ghost" size="icon"><Crop /></Button></PopoverTrigger>
                            <PopoverContent container={playerRef.current} align="end" className="w-48 bg-black/70 backdrop-blur-sm border-white/20 text-white p-2 mb-2">
                                <div className="grid gap-1">
                                    <div onClick={() => handleFitModeChange('contain')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-white/10", fitMode === 'contain' && "bg-primary text-primary-foreground hover:bg-primary/90")}>Original</div>
                                    <div onClick={() => handleFitModeChange('cover')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-white/10", fitMode === 'cover' && "bg-primary text-primary-foreground hover:bg-primary/90")}>Fit to Screen</div>
                                    <div onClick={() => handleFitModeChange('fill')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-white/10", fitMode === 'fill' && "bg-primary text-primary-foreground hover:bg-primary/90")}>Stretch</div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {isPipSupported && (
                        <Button variant="ghost" size="icon" onClick={togglePictureInPicture}>
                            <PictureInPicture2 />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>{isFullscreen ? <Minimize /> : <Maximize />}</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

    

    
