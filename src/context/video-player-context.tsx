'use client';

import React, { createContext, useContext, useState, RefObject } from 'react';

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);

  return (
    <VideoPlayerContext.Provider value={{ playerRef, setPlayerRef }}>
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
