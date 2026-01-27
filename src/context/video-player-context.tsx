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
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow initial autoplay

  // This is the single source of truth for the user's mute preference.
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // This effect syncs the user's mute preference (from context state) to the video element.
  useEffect(() => {
    const video = playerRef?.current;
    if (!video) return;

    // Apply the global mute state to the video element.
    video.muted = isMuted;

    // This listener handles cases where the video's mute state might be changed externally
    // (e.g., by browser controls) and syncs it back to our context state.
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
