'use client';

import React, { createContext, useContext, useState, RefObject, useEffect, useCallback } from 'react';

// Define handles here to be accessible globally without circular deps
export interface VideoPlayerActions {
  getVideoElement: () => HTMLVideoElement | null;
  togglePictureInPicture: () => Promise<void>;
  requestFullscreen: () => void;
}

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  playerActionsRef: RefObject<VideoPlayerActions> | null;
  setPlayerActionsRef: (ref: RefObject<VideoPlayerActions> | null) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [playerActionsRef, setPlayerActionsRef] = useState<RefObject<VideoPlayerActions> | null>(null);
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow initial autoplay

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  useEffect(() => {
    const video = playerRef?.current;
    if (!video) return;

    video.muted = isMuted;

    const handleVolumeChange = () => {
        if (video.muted !== isMuted) {
            setIsMuted(video.muted);
        }
    };

    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
        if (video) {
            video.removeEventListener('volumechange', handleVolumeChange);
        }
    };
  }, [playerRef, isMuted]);

  const contextValue = {
    playerRef,
    setPlayerRef,
    playerActionsRef,
    setPlayerActionsRef,
    isMuted,
    toggleMute,
  };

  return (
    <VideoPlayerContext.Provider value={contextValue}>
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
