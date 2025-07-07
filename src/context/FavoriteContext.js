import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoriteContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // 로컬 스토리지에서 찜 목록 불러오기
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // 찜 목록 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // 찜 목록에 추가
  const addToFavorites = (restaurant) => {
    if (!favorites.find(fav => fav.id === restaurant.id)) {
      setFavorites(prev => [...prev, restaurant]);
    }
  };

  // 찜 목록에서 제거
  const removeFromFavorites = (restaurantId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
  };

  // 찜 목록에 있는지 확인
  const isInFavorites = (restaurantId) => {
    return favorites.some(fav => fav.id === restaurantId);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}; 