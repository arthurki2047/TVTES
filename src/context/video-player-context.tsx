'use client';

import React, { createContext, useContext, useState, RefObject, useEffect, useCallback } from 'react';

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    const video = playerRef?.current;
    if (video) {
        video.muted = !video.muted;
    }
  }, [playerRef]);
  
  // Effect to sync mute state from video element to context
  useEffect(() => {
    const video = playerRef?.current;
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
  }, [playerRef, isMuted]);


  return (
    <VideoPlayerContext.Provider value={{ playerRef, setPlayerRef, isMuted, toggleMute }}>
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
