
'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLeft, ChevronRight, ArrowLeft, Lock, Unlock, Settings, RotateCcw, RotateCw, Crop, PictureInPicture2 } from 'lucide-react';
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
  const { setPlayerRef, isMuted, toggleMute: contextToggleMute } = useVideoPlayer();
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
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

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
  
  /**
   * --- AUTOPLAY HANDLING ---
   * This function attempts to play the video.
   * Modern browsers have strict autoplay policies. Playback will usually only start if:
   * 1. The video is muted.
   * 2. The user has interacted with the site before (e.g., clicked a button).
   * This component relies on the user navigating to this page, which counts as an interaction.
   * If autoplay fails, the user can manually start playback with the play button.
   */
  const playVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(error => {
        // We catch the AbortError which can happen if the user navigates away quickly.
        // Other errors (like NotAllowedError for autoplay) are logged but don't crash the app.
        if (error.name !== 'AbortError') {
          console.error("Video play failed:", error);
        }
      });
    }
  },[]);
  
  /**
   * --- STREAM LOADING & ERROR HANDLING ---
   * This function initializes the video player based on the stream type (HLS or MP4).
   * For HLS streams, it uses the hls.js library to handle playback.
   * For MP4, it uses the native HTML5 <video> element.
   */
  const initializeHls = useCallback(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    // Clean up any existing HLS instance before initializing a new one.
    if (hlsRef.current) {
        hlsRef.current.destroy();
    }
    
    // Reset player state for the new stream.
    setPlayerError(null);
    setQualityLevels([]);
    setCurrentQuality(-1);
    setIsManifestLive(false);

    if (type === 'hls') {
        import('hls.js').then(Hls => {
            if (Hls.default.isSupported()) {
                const hls = new Hls.default({
                    // HLS.js configuration for better live stream performance and error recovery.
                    liveSyncDurationCount: 3,
                    maxMaxBufferLength: 30,
                    liveDurationInfinity: true,
                    fragLoadingTimeOut: 20000,
                    manifestLoadingTimeOut: 10000,
                    levelLoadingTimeOut: 10000,
                    fragLoadingMaxRetry: 4,
                    manifestLoadingMaxRetry: 2,
                    levelLoadingMaxRetry: 4,
                    backBufferLength: 90
                });
                hlsRef.current = hls;

                /**
                 * --- ERROR HANDLING ---
                 * HLS.js provides an error event listener. We hook into it to detect
                 * fatal errors (e.g., manifest not found, network issues) and either
                 * attempt to recover or display an error message to the user.
                 */
                hls.on(Hls.default.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch(data.type) {
                          case Hls.default.ErrorTypes.NETWORK_ERROR:
                            // Attempt to recover from network errors.
                            setPlayerError(`Stream failed to load. Please check your network connection or the stream source. Details: ${data.details}.`);
                            if (hlsRef.current) {
                              hlsRef.current.startLoad();
                            }
                            break;
                          case Hls.default.ErrorTypes.MEDIA_ERROR:
                            setPlayerError('A media error occurred. Trying to recover...');
                            if (hlsRef.current) {
                              hlsRef.current.recoverMediaError();
                            }
                            break;
                          default:
                            // For other fatal errors, show a message and stop playback.
                            setPlayerError(`An unrecoverable playback error occurred. Details: ${data.details}.`);
                            if (hlsRef.current) {
                              hlsRef.current.destroy();
                            }
                            break;
                        }
                    }
                });

                // This event fires when the HLS manifest has been successfully loaded and parsed.
                hls.on(Hls.default.Events.MANIFEST_PARSED, (event, data) => {
                     if (data.details) {
                        const isStreamLive = data.details.live || data.details.type?.toUpperCase() === 'LIVE';
                        setIsManifestLive(isStreamLive);
                     }
                     setPlayerError(null);
                     // --- AUTOPLAY ---
                     // Once the manifest is ready, we attempt to play the video automatically.
                     playVideo(currentVideo);
                     if (hls.levels && hls.levels.length > 1) {
                        setQualityLevels(hls.levels);
                     }
                });

                hls.on(Hls.default.Events.LEVEL_SWITCHED, (event, data) => {
                    setCurrentQuality(data.level)
                });
                
                // --- AUTO-LOAD ---
                // This is the call that starts loading the HLS stream source.
                hls.loadSource(decodedSrc);
                hls.attachMedia(currentVideo);

            } else if (currentVideo.canPlayType('application/vnd.apple.mpegurl')) {
                // For browsers that support HLS natively (like Safari).
                currentVideo.src = decodedSrc;
                playVideo(currentVideo);
            }
        });
    } else if (type === 'mp4') {
        // For direct MP4 links, we just set the src and play.
        currentVideo.src = decodedSrc;
        playVideo(currentVideo);
    }
  }, [decodedSrc, type, playVideo]);

  useEffect(() => {
    setIsClient(true);
    setPlayerRef(videoRef);
    // --- PiP FEATURE DETECTION ---
    // Check if PiP is enabled in the browser. This is the first step for progressive enhancement.
    // The UI button for PiP will only be rendered if this is true.
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      setIsPiPSupported(document.pictureInPictureEnabled);
    }
    return () => {
      setPlayerRef(null);
    };
  }, [setPlayerRef]);

  /**
   * --- AUTO-LOAD TRIGGER ---
   * This `useEffect` hook runs when the component mounts or when the `initializeHls`
   * function changes (which happens if the `src` prop changes).
   * By calling `initializeHls()` here, we ensure that the video stream
   * begins to load automatically as soon as the player is on the screen.
   */
  useEffect(() => {
    initializeHls();
    const video = videoRef.current;
    return () => {
        if (hlsRef.current) hlsRef.current.destroy();
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
    }
  }, [initializeHls]);

  const isLive = duration === Infinity || isManifestLive;

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

  /**
   * --- PLAY/PAUSE CONTROL ---
   * This function is called when the user clicks the main play/pause button in the UI.
   * It toggles the playback state of the video.
   */
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
  
  /**
   * --- PICTURE-IN-PICTURE (PIP) IMPLEMENTATION ---
   * This section follows best practices for implementing PiP mode.
   */

  /**
   * Toggles Picture-in-Picture mode.
   * This function is designed to be robust and cross-browser compatible,
   * handling entering/exiting PiP and common errors.
   */
  const togglePictureInPicture = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    // 1. Check for browser support AND if PiP is disabled on the video element.
    // 'video.disablePictureInPicture' allows disabling PiP on a per-video basis.
    if (!isPiPSupported || video.disablePictureInPicture) {
        console.warn('Picture-in-Picture is not supported or is disabled for this video.');
        return;
    }

    // 2. Toggle PiP state.
    // 'document.pictureInPictureElement' securely checks if an element is currently in PiP.
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture()
          .catch(err => console.error("Error exiting Picture-in-Picture mode:", err));
    } else {
        // Request PiP for the current video. This can be done even if paused.
        video.requestPictureInPicture()
          .catch(err => {
            // 3. Handle common errors, like 'NotAllowedError' if the user hasn't
            // interacted with the page, or if it's blocked by browser policies.
            console.error("Error entering Picture-in-Picture mode:", err);
            if (err.name === 'NotAllowedError') {
                setPlayerError('PiP was not allowed. Please click on the player first.');
            }
          });
    }
    resetControlsTimeout();
  }, [resetControlsTimeout, isPiPSupported]);

  // Adds a keyboard shortcut ('P' key) for toggling Picture-in-Picture.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modifier keys are pressed or if input fields are focused.
      const target = e.target as HTMLElement;
      if (e.key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePictureInPicture(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePictureInPicture]);


  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    requestFullscreen: () => toggleFullscreen(),
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
    const handleWaiting = () => {}; // Could show a spinner
    const handlePlaying = () => resetControlsTimeout();
    
    const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement || !!(document as any).webkitIsFullScreen;
        setIsFullscreen(isCurrentlyFullscreen);
        if (!isCurrentlyFullscreen) {
            setIsLocked(false);
            if (screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock();
        }
    };
    
    const handleMouseLeave = () => { if (!isLocked && videoRef.current && !videoRef.current.paused) { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); setShowControls(false); } };
    
    // --- Picture-in-Picture Event Handling ---
    // These events are crucial for updating the UI based on PiP state.
    // They fire automatically, ensuring smooth UI transitions.
    // Performance: Using requestAnimationFrame is unnecessary here as we're just
    // setting state, and the browser handles the transition animation itself.
    const handleEnterPiP = () => setIsInPiP(true);
    const handleLeavePiP = () => setIsInPiP(false);
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);
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
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
      player.removeEventListener('mousemove', resetControlsTimeout);
      player.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
    };
  }, [resetControlsTimeout, isLocked, playVideo]);

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

  return (
    <div ref={playerRef} className="group relative w-full aspect-video bg-black text-white" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseMove={resetControlsTimeout}>
      <video ref={videoRef} className={cn("h-full w-full", { 'object-contain': fitMode === 'contain', 'object-cover': fitMode === 'cover', 'object-fill': fitMode === 'fill' })} playsInline onClick={handleTap} data-channel-id={channel.id} />
      
      {playerError && !isInPiP && (
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

      <div className={cn("video-controls-container absolute inset-0 flex flex-col justify-between transition-opacity", (showControls && !isLocked && !isInPiP) ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/60" />

        <div className="p-2 md:p-4 flex justify-between items-center">
            <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={(e) => { e.stopPropagation(); onBack(); }}><ArrowLeft /></Button>
            {isFullscreen && (<Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-white/20 hover:text-white" onClick={toggleLock}><Lock /></Button>)}
        </div>
        
        <div className="flex-1 flex items-center justify-between px-2 md:px-8" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={handlePrevChannel} className="h-16 w-16 rounded-full bg-accent/20 backdrop-blur-md transition-all hover:bg-accent/40 hover:scale-110 shadow-lg shadow-accent/20"><ChevronLeft size={40} /></Button>
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => handleSeek(-30)} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"><RotateCcw size={32} /></Button>
            <Button variant="ghost" size="icon" onClick={togglePlay} className="h-20 w-20 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">{isPlaying ? <Pause size={56} /> : <Play size={56} className="ml-1" />}</Button>
            <Button variant="ghost" size="icon" onClick={() => handleSeek(30)} className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"><RotateCw size={32} /></Button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextChannel} className="h-16 w-16 rounded-full bg-accent/20 backdrop-blur-md transition-all hover:bg-accent/40 hover:scale-110 shadow-lg shadow-accent/20"><ChevronRight size={40} /></Button>
        </div>

        <div className="pt-8 pb-2 md:pb-4" onClick={e => e.stopPropagation()}>
            {(duration > 0) && (
                <div className="px-4 md:px-6 mb-2">
                    <Slider value={[isLive ? duration : progress]} max={duration} onValueChange={(value) => { if (videoRef.current) videoRef.current.currentTime = value[0]; }} className="w-full" />
                    <div className="flex justify-between text-xs font-mono text-white/80 mt-1">
                      {isLive ? (
                        <div className="flex items-center gap-1.5">
                            <div className="relative flex h-2.5 w-2.5"><div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div><div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></div></div>
                            <span className="text-sm font-medium uppercase text-red-400 tracking-wider">Live</span>
                        </div>
                      ) : (<span>{formatTime(progress)}</span>)}
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            )}
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
                    {/* The PiP button is only rendered if the browser supports the API. */}
                    {isPiPSupported && (<Button variant="ghost" size="icon" onClick={togglePictureInPicture}><PictureInPicture2 /></Button>)}
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>{isFullscreen ? <Minimize /> : <Maximize />}</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
