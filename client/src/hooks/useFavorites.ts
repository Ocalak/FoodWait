import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'mcr_mcp_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (shopId: string) => {
    setFavorites((prev) => {
      if (prev.includes(shopId)) {
        return prev.filter((id) => id !== shopId);
      } else {
        return [...prev, shopId];
      }
    });
  };

  const isFavorite = (shopId: string) => favorites.includes(shopId);

  const addFavorite = (shopId: string) => {
    if (!favorites.includes(shopId)) {
      setFavorites((prev) => [...prev, shopId]);
    }
  };

  const removeFavorite = (shopId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== shopId));
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
}
