import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

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

  // 사용자 즐겨찾기 목록 불러오기 (Supabase에서)
  const loadFavorites = async () => {
    console.log('loadFavorites 호출됨, 사용자:', user);
    if (!user) {
      console.log('사용자가 없어서 loadFavorites 중단');
      return;
    }
    
    try {
      setLoading(true);
      
      // Supabase에서 사용자의 찜 목록 가져오기
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select(`
          *,
          restaurants (*)
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Supabase에서 찜 목록 불러오기 실패:', error);
        setFavorites([]);
        return;
      }
      
      // restaurants 정보를 포함한 찜 목록 생성
      const restaurants = favoritesData.map(fav => fav.restaurants);
      console.log('Supabase에서 찜 목록 로드 완료:', restaurants.length, '개');
      setFavorites(restaurants);
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

  // 찜 목록에 추가 (Supabase에 저장)
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
      console.log('즐겨찾기 추가 시작:', { 
        restaurantId: restaurant.id, 
        userId: user.id,
        restaurantIdType: typeof restaurant.id,
        userIdType: typeof user.id,
        restaurant: restaurant
      });
      
      // 데이터 타입 확인 및 변환
      const userId = parseInt(user.id);
      const restaurantId = parseInt(restaurant.id);

      if (isNaN(userId) || isNaN(restaurantId)) {
        console.error('데이터 타입 오류:', { userId, restaurantId });
        alert('데이터 형식이 올바르지 않습니다.');
        return;
      }

      console.log('변환된 데이터:', { userId, restaurantId });

      // Supabase 연결 상태 확인
      console.log('Supabase 클라이언트 확인:', {
        supabaseUrl: supabase.supabaseUrl,
        hasClient: !!supabase
      });

      // 먼저 restaurants 테이블에 해당 레스토랑이 있는지 확인
      const { data: existingRestaurant, error: restaurantCheckError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('id', restaurantId)
        .single();

      console.log('레스토랑 존재 확인:', { existingRestaurant, restaurantCheckError });

      if (restaurantCheckError) {
        console.error('레스토랑 존재 확인 실패:', restaurantCheckError);
        alert('레스토랑 정보를 찾을 수 없습니다.');
        return;
      }

      // users 테이블에 해당 사용자가 있는지 확인
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      console.log('사용자 존재 확인:', { existingUser, userCheckError });

      if (userCheckError) {
        console.error('사용자 존재 확인 실패:', userCheckError);
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }
      
      // Supabase에 찜하기 저장
      const insertData = {
        user_id: userId,
        restaurant_id: restaurantId,
        created_at: new Date().toISOString()
      };

      console.log('삽입할 데이터:', insertData);

      const { data: insertResult, error } = await supabase
        .from('favorites')
        .insert(insertData)
        .select();
      
      console.log('Supabase 삽입 결과:', { insertResult, error });
      
      if (error) {
        console.error('Supabase 찜하기 저장 실패:', error);
        console.error('에러 상세 정보:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        alert(`찜하기 저장에 실패했습니다: ${error.message}`);
        return; // 실패 시 로컬 상태 업데이트하지 않음
      }
      
      console.log('Supabase 찜하기 저장 성공:', insertResult);
      
      // Supabase 저장 성공 시에만 로컬 상태 업데이트
      const newFavorites = [...favorites, restaurant];
      setFavorites(newFavorites);
      
      console.log('즐겨찾기 추가 성공:', restaurant.id);
      alert('찜 목록에 추가되었습니다! 🎉');
    } catch (error) {
      console.error('즐겨찾기 추가 중 예상치 못한 오류:', error);
      alert(`즐겨찾기 추가 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 찜 목록에서 제거 (Supabase에서 삭제)
  const removeFromFavorites = async (restaurantId) => {
    console.log('removeFromFavorites 호출됨:', restaurantId, '사용자:', user);
    if (!user) {
      console.log('사용자가 로그인되지 않음');
      return;
    }

    try {
      console.log('즐겨찾기 제거 시작:', { 
        restaurantId: restaurantId, 
        userId: user.id,
        restaurantIdType: typeof restaurantId,
        userIdType: typeof user.id
      });
      
      // 데이터 타입 확인 및 변환
      const userId = parseInt(user.id);
      const restaurantIdInt = parseInt(restaurantId);

      if (isNaN(userId) || isNaN(restaurantIdInt)) {
        console.error('데이터 타입 오류:', { userId, restaurantIdInt });
        alert('데이터 형식이 올바르지 않습니다.');
        return;
      }

      console.log('변환된 데이터:', { userId, restaurantIdInt });
      
      // Supabase에서 찜하기 삭제
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantIdInt);
      
      if (error) {
        console.error('Supabase 찜하기 삭제 실패:', error);
        alert(`찜하기 삭제에 실패했습니다: ${error.message}`);
        return; // 실패 시 로컬 상태 업데이트하지 않음
      }
      
      // Supabase 삭제 성공 시에만 로컬 상태 업데이트
      const newFavorites = favorites.filter(fav => fav.id !== restaurantId);
      setFavorites(newFavorites);
      
      console.log('즐겨찾기 제거 성공:', restaurantId);
      alert('찜 목록에서 제거되었습니다! ❌');
    } catch (error) {
      console.error('즐겨찾기 제거 중 예상치 못한 오류:', error);
      alert(`즐겨찾기 제거 중 오류가 발생했습니다: ${error.message}`);
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