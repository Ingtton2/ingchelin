import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  const [loading, setLoading] = useState(false);
  const { currentUser: user } = useAuth();

  // 사용자 즐겨찾기 목록 불러오기
  const loadFavorites = async () => {
    console.log('loadFavorites 호출됨, 사용자:', user); // 디버깅용
    if (!user) {
      console.log('사용자가 없어서 loadFavorites 중단');
      return;
    }
    
    try {
      setLoading(true);
      // 로컬 스토리지에서 즐겨찾기 불러오기
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        const restaurants = JSON.parse(savedFavorites);
        console.log('로컬 즐겨찾기 목록:', restaurants);
        console.log('레스토랑 개수:', restaurants.length);
        setFavorites(restaurants);
      } else {
        console.log('저장된 즐겨찾기 없음');
        setFavorites([]);
      }
    } catch (error) {
      console.error('즐겨찾기 목록 불러오기 실패:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 로그인 시 즐겨찾기 목록 불러오기
  useEffect(() => {
    console.log('사용자 상태 변경:', user);
    if (user) {
      console.log('사용자 로그인됨, 찜 목록 불러오기 시작:', user.id);
      loadFavorites();
    } else {
      console.log('사용자 로그아웃됨, 찜 목록 초기화');
      setFavorites([]);
    }
  }, [user]);

  // 찜 목록에 추가
  const addToFavorites = async (restaurant) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 즐겨찾기에 있는지 확인
    if (favorites.find(fav => fav.id === restaurant.id)) {
      console.log('이미 즐겨찾기에 있음:', restaurant.id);
      return;
    }

    try {
      console.log('즐겨찾기 추가 시작:', restaurant.id, '사용자:', user.id);
      
      // 로컬 스토리지에 즐겨찾기 추가
      const newFavorites = [...favorites, restaurant];
      setFavorites(newFavorites);
      
      // 로컬 스토리지에 저장
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
      
      console.log('즐겨찾기 추가 성공:', restaurant.id);
      alert('찜 목록에 추가되었습니다! 🎉');
    } catch (error) {
      console.error('즐겨찾기 추가 중 오류:', error);
      alert('즐겨찾기 추가 중 오류가 발생했습니다.');
    }
  };

  // 찜 목록에서 제거
  const removeFromFavorites = async (restaurantId) => {
    console.log('removeFromFavorites 호출됨:', restaurantId, '사용자:', user);
    if (!user) {
      console.log('사용자가 로그인되지 않음');
      return;
    }

    try {
      console.log('즐겨찾기 제거 시작:', restaurantId, '사용자:', user.id);
      
      // 상태 즉시 업데이트 - restaurantId로 필터링
      const newFavorites = favorites.filter(fav => fav.id !== restaurantId);
      setFavorites(newFavorites);
      
      // 로컬 스토리지에 저장
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
      
      console.log('즐겨찾기 제거 성공:', restaurantId);
      alert('찜 목록에서 제거되었습니다! ❌');
    } catch (error) {
      console.error('즐겨찾기 제거 중 오류:', error);
      alert('즐겨찾기 제거 중 오류가 발생했습니다.');
    }
  };

  // 찜 목록에 있는지 확인
  const isInFavorites = (restaurantId) => {
    const isFavorited = favorites.some(fav => fav.id === restaurantId);
    console.log(`레스토랑 ${restaurantId} 찜 상태:`, isFavorited, '현재 찜 목록:', favorites.map(f => f.id));
    return isFavorited;
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    loading
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}; 