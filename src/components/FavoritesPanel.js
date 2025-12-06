import React, { useEffect } from 'react';

const FavoritesPanel = ({ favorites, onInitializeFavorites, children }) => {
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('drug-explorer-favorites') || '[]');
    if (savedFavorites.length > 0 && onInitializeFavorites) {
      onInitializeFavorites(savedFavorites);
    }
  }, [onInitializeFavorites]);

  useEffect(() => {
    localStorage.setItem('drug-explorer-favorites', JSON.stringify(favorites));
  }, [favorites]);

  return <>{children}</>;
};

export default FavoritesPanel;
