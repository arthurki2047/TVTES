'use client';

import React, { createContext, useContext, useState, RefObject, useEffect, useCallback } from 'react';

interface VideoPlayerContextType {
  playerRef: RefObject<HTMLVideoElement> | null;
  setPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  pipPlayerRef: RefObject<HTMLVideoElement> | null;
  setPipPlayerRef: (ref: RefObject<HTMLVideoElement> | null) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerRef, setPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [pipPlayerRef, setPipPlayerRef] = useState<RefObject<HTMLVideoElement> | null>(null);
  const [isMuted, setIsMuted] = useState(false);

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
    <VideoPlayerContext.Provider value={{ playerRef, setPlayerRef, pipPlayerRef, setPipPlayerRef, isMuted, toggleMute }}>
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
