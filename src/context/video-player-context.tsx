'use client';

import React, { createContext, useContext, useState, RefObject, useEffect } from 'react';

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  pipPlayerRef: RefObject<HTMLVideoElement> | null;
  setPipPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [pipPlayerRef, setPipPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);

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

  // This effect handles pausing the video when it leaves PiP.
  useEffect(() => {
    const videoElement = pipPlayerRef?.current;
    if (!videoElement) return;

    const handleLeavePiP = () => {
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
      // Clean up the PiP ref once it's no longer in PiP
      setPipPlayerRef(null);
    };

    videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
      }
    };
  }, [pipPlayerRef]);


  return (
    <VideoPlayerContext.Provider value={{ playerRef, setPlayerRef, pipPlayerRef, setPipPlayerRef }}>
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
