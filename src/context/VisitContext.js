import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // localStorage에서 방문 상태 로드
  useEffect(() => {
    const savedVisitStatus = localStorage.getItem('visitStatus');
    if (savedVisitStatus) {
      setVisitStatus(JSON.parse(savedVisitStatus));
    }
  }, []);

  // 방문 상태 변경시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('visitStatus', JSON.stringify(visitStatus));
  }, [visitStatus]);

  // 방문 상태 설정
  const setRestaurantVisitStatus = (restaurantId, status) => {
    setVisitStatus(prev => ({
      ...prev,
      [restaurantId]: status
    }));
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
    getVisitStats
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
}; 