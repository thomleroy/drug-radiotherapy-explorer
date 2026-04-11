import React, { useEffect } from 'react';
import { readFavorites, writeFavorites } from '../utils/security';

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
