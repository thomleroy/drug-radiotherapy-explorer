import React, { useEffect } from 'react';

const STORAGE_KEY = 'drug-explorer-favorites';

// Defensive reader: ignore corrupted or unexpected localStorage payloads.
const readFavorites = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => typeof item === 'string' || typeof item === 'number'
    );
  } catch {
    return [];
  }
};

const writeFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Quota exceeded or storage disabled (private mode): silently ignore.
  }
};

const FavoritesPanel = ({ favorites, onInitializeFavorites, children }) => {
  useEffect(() => {
    const savedFavorites = readFavorites();
    if (savedFavorites.length > 0 && onInitializeFavorites) {
      onInitializeFavorites(savedFavorites);
    }
  }, [onInitializeFavorites]);

  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  return <>{children}</>;
};

export default FavoritesPanel;
