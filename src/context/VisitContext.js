import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const VisitContext = createContext();

export const useVisit = () => {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error('useVisit must be used within a VisitProvider');
  }
  return context;
};

export const VisitProvider = ({ children }) => {
  const [visitStatus, setVisitStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const { currentUser: user } = useAuth();

  // 사용자 방문 기록 불러오기
  const loadVisitStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/visits/user/${user.id}`);
      if (response.ok) {
        const visits = await response.json();
        const statusMap = {};
        visits.forEach(visit => {
          statusMap[visit.restaurant.id] = visit.rating >= 4 ? 'liked' : 'disliked';
        });
        setVisitStatus(statusMap);
      }
    } catch (error) {
      console.error('방문 기록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 로그인 시 방문 기록 불러오기
  useEffect(() => {
    if (user) {
      loadVisitStatus();
    } else {
      setVisitStatus({});
    }
  }, [user]);

  // 방문 상태 설정 (백엔드에 저장)
  const setRestaurantVisitStatus = async (restaurantId, status) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const rating = status === 'liked' ? 5 : 2; // 좋아함: 5점, 싫어함: 2점
      
      const response = await fetch('http://localhost:8080/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          restaurantId: restaurantId,
          rating: rating,
          review: status === 'liked' ? '좋아요!' : '별로예요.'
        })
      });

      if (response.ok) {
        setVisitStatus(prev => ({
          ...prev,
          [restaurantId]: status
        }));
      } else {
        console.error('방문 기록 저장 실패');
      }
    } catch (error) {
      console.error('방문 기록 저장 중 오류:', error);
    }
  };

  // 방문 상태 가져오기
  const getRestaurantVisitStatus = (restaurantId) => {
    return visitStatus[restaurantId] || 'not-visited'; // 'liked', 'disliked', 'not-visited'
  };

  // 방문 상태별 통계
  const getVisitStats = () => {
    const stats = {
      liked: 0,
      disliked: 0,
      notVisited: 0
    };

    Object.values(visitStatus).forEach(status => {
      if (status === 'liked') stats.liked++;
      else if (status === 'disliked') stats.disliked++;
    });

    // 전체 식당 수에서 방문한 곳을 빼면 안 가본 곳
    const totalRestaurants = 20; // 현재 식당 데이터 수
    stats.notVisited = totalRestaurants - stats.liked - stats.disliked;

    return stats;
  };

  const value = {
    visitStatus,
    setRestaurantVisitStatus,
    getRestaurantVisitStatus,
    getVisitStats,
    loading
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
}; 