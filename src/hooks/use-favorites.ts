'use client';
import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'amartv-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      try {
        if(typeof window !== 'undefined') {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        }
      } catch (error) {
        console.error('Failed to save favorites to localStorage', error);
      }
      return newFavorites;
    });
  }, []);
  
  const isFavorite = useCallback((channelId: string) => {
    return favorites.includes(channelId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
