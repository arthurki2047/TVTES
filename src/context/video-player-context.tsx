'use client';

import React, { createContext, useContext, useState, RefObject, useEffect } from 'react';

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);

  useEffect(() => {
    const videoElement = playerRef?.current;
    if (!videoElement) {
      return;
    }

    const handleLeavePiP = () => {
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    };

    videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
      }
    };
  }, [playerRef]);


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
