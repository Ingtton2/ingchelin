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
      console.log('API 호출 시작:', `http://localhost:8080/api/favorites/user/${user.id}`);
      const response = await fetch(`http://localhost:8080/api/favorites/user/${user.id}`);
      console.log('즐겨찾기 목록 응답:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('즐겨찾기 목록 데이터:', data);
        console.log('데이터 길이:', data.length);
        
        const restaurants = data.map(fav => fav.restaurant);
        console.log('매핑된 레스토랑 목록:', restaurants);
        console.log('레스토랑 개수:', restaurants.length);
        
        setFavorites(restaurants);
        console.log('즐겨찾기 상태 업데이트 완료, 개수:', restaurants.length);
      } else {
        console.error('즐겨찾기 목록 불러오기 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 상세:', errorText);
      }
    } catch (error) {
      console.error('즐겨찾기 목록 불러오기 실패:', error);
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
      const response = await fetch('http://localhost:8080/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          restaurantId: restaurant.id
        })
      });

      console.log('백엔드 응답:', response.status, response.ok);
      if (response.ok) {
        try {
          // 백엔드 응답에서 실제 추가된 데이터 가져오기
          const addedFavorite = await response.json();
          console.log('백엔드 응답 데이터:', addedFavorite);
          console.log('추가된 레스토랑 정보:', addedFavorite.restaurant);
          
          // 상태 즉시 업데이트 - 백엔드에서 반환한 restaurant 정보 사용
          setFavorites(prev => {
            const newFavorites = [...prev, addedFavorite.restaurant];
            console.log('즐겨찾기 상태 업데이트:', prev.length, '->', newFavorites.length);
            return newFavorites;
          });
          console.log('즐겨찾기 추가 성공:', restaurant.id);
          alert('찜 목록에 추가되었습니다! 🎉');
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          alert('응답 처리 중 오류가 발생했습니다.');
        }
      } else {
        console.error('즐겨찾기 추가 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 상세:', errorText);
        alert('찜 목록에 추가하는데 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('즐겨찾기 추가 중 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
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
      console.log('백엔드 API 호출 시작:', `http://localhost:8080/api/favorites/user/${user.id}/restaurant/${restaurantId}`);
      const response = await fetch(`http://localhost:8080/api/favorites/user/${user.id}/restaurant/${restaurantId}`, {
        method: 'DELETE'
      });

      console.log('백엔드 응답:', response.status, response.ok);
      if (response.ok) {
        // 상태 즉시 업데이트 - restaurantId로 필터링
        setFavorites(prev => {
          const newFavorites = prev.filter(fav => fav.id !== restaurantId);
          console.log('즐겨찾기 상태 업데이트:', prev.length, '->', newFavorites.length);
          return newFavorites;
        });
        console.log('즐겨찾기 제거 성공:', restaurantId);
        
        // 성공 메시지 표시
        alert('찜 목록에서 제거되었습니다! ❌');
      } else {
        console.error('즐겨찾기 제거 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 상세:', errorText);
        alert('찜 목록에서 제거하는데 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('즐겨찾기 제거 중 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
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