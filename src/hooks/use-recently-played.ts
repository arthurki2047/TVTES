'use client';
import { useState, useEffect, useCallback } from 'react';

const RECENTLY_PLAYED_KEY = 'amartv-recently-played';
const MAX_RECENTLY_PLAYED = 6;

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
      if (stored) {
        setRecentlyPlayed(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recently played from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const addRecentlyPlayed = useCallback((channelId: string) => {
    setRecentlyPlayed(prev => {
      // Remove the channel if it already exists to move it to the front
      const filtered = prev.filter(id => id !== channelId);
      // Add the new channel to the front
      const newRecentlyPlayed = [channelId, ...filtered];
      // Limit the number of recently played items
      const limited = newRecentlyPlayed.slice(0, MAX_RECENTLY_PLAYED);
      
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(limited));
        }
      } catch (error) {
        console.error('Failed to save recently played to localStorage', error);
      }
      return limited;
    });
  }, []);

  return { recentlyPlayed, addRecentlyPlayed, isLoaded };
}
