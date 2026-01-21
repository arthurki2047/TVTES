'use client';

import React, { createContext, useContext, useState, RefObject, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  pipPlayerRef: RefObject<HTMLVideoElement> | null;
  setPipPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  pipHlsRef: RefObject<any> | null;
  setPipHlsRef: (ref: RefObject<any> | null) => void;
  isMuted: boolean;
  toggleMute: () => void;
  pipChannelId: string | null;
  setPipChannelId: (id: string | null) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [pipPlayerRef, setPipPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [pipHlsRef, setPipHlsRef] = useState<RefObject<any> | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [pipChannelId, setPipChannelId] = useState<string | null>(null);

  const toggleMute = useCallback(() => {
    const video = playerRef?.current || pipPlayerRef?.current;
    if (video) {
        video.muted = !video.muted;
    }
  }, [playerRef, pipPlayerRef]);

  // This effect handles closing an old PiP window when a new player is created on a watch page.
  useEffect(() => {
    if (playerRef && pipPlayerRef && playerRef.current !== pipPlayerRef.current) {
      if (document.pictureInPictureElement === pipPlayerRef.current) {
        document.exitPictureInPicture().catch((err) => {
            console.error("Failed to exit Picture-in-Picture mode automatically.", err);
        });
      }
    }
  }, [playerRef, pipPlayerRef]);

  // This effect handles user exiting PiP.
  useEffect(() => {
    const videoElement = pipPlayerRef?.current;
    if (!videoElement) return;

    const handleLeavePiP = () => {
      // This is a heuristic. When a user closes the PiP window via the 'X' button,
      // the browser often tears down the video element, setting its readyState to 0.
      // When restoring by clicking the "back to tab" icon, the video element is
      // kept alive and its readyState remains greater than 0.
      const isLikelyRestore = videoElement && videoElement.readyState > 0 && !videoElement.ended;

      // Always destroy the HLS instance of the old PiP player to prevent dual audio.
      if (pipHlsRef?.current) {
        pipHlsRef.current.destroy();
      }

      // Only navigate if it's a restore action.
      if (isLikelyRestore && pipChannelId) {
        router.push(`/watch/${pipChannelId}?fullscreen=true`);
      }
      
      // Clean up the PiP ref once it's no longer in PiP, regardless of the action.
      setPipPlayerRef(null);
      setPipHlsRef(null);
      setPipChannelId(null);
    };

    videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
      }
    };
  }, [pipPlayerRef, pipHlsRef, pipChannelId, router]);
  
  // Effect to sync mute state from video element to context
  useEffect(() => {
    const video = playerRef?.current || pipPlayerRef?.current;
    if (!video) return;

    const handleVolumeChange = () => {
        if (video.muted !== isMuted) {
            setIsMuted(video.muted);
        }
    };

    video.addEventListener('volumechange', handleVolumeChange);

    // Initial sync
    if (video.muted !== isMuted) {
        setIsMuted(video.muted);
    }

    return () => {
        if (video) {
            video.removeEventListener('volumechange', handleVolumeChange);
        }
    };
  }, [playerRef, pipPlayerRef, isMuted]);


  return (
    <VideoPlayerContext.Provider value={{ playerRef, setPlayerRef, pipPlayerRef, setPipPlayerRef, isMuted, toggleMute, pipChannelId, setPipChannelId, pipHlsRef, setPipHlsRef }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
}
