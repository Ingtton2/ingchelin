import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useVisit } from '../context/VisitContext';
import { restaurantData } from '../data/restaurantData';
import './RandomRecommendation.css';

const RandomRecommendation = () => {
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    region: 'all',
    maxDistance: 'all',
    maxPrice: 'all',
    mood: 'all'
  });
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { getRestaurantVisitStatus } = useVisit();

  const categories = ['all', '한식', '양식', '일식', '중식', '동남아식', '카페'];
  const regionOptions = [
    { value: 'all', label: '전체 지역' },
    { value: 'seoul', label: '서울시' },
    { value: 'bundang', label: '성남시 분당구' }
  ];
  const distanceOptions = [
    { value: 'all', label: '거리 무관' },
    { value: '1', label: '1km 이내' },
    { value: '2', label: '2km 이내' },
    { value: '3', label: '3km 이내' }
  ];
  const priceOptions = [
    { value: 'all', label: '가격 무관' },
    { value: '10000', label: '1만원 이하' },
    { value: '20000', label: '2만원 이하' },
    { value: '30000', label: '3만원 이하' }
  ];
  const moodOptions = [
    { value: 'all', label: '분위기 무관' },
    { value: 'solo', label: '혼밥 가능' },
    { value: 'date', label: '데이트 코스' },
    { value: 'group', label: '단체 모임' }
  ];

  // 거리 계산 함수
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // km
  };

  // 가격 문자열에서 숫자 추출
  const extractPrice = (priceStr) => {
    const match = priceStr.match(/(\d+)만원/);
    return match ? parseInt(match[1]) * 10000 : 50000;
  };

  // 필터링된 레스토랑 목록 생성
  const getFilteredRestaurants = () => {
    let filtered = restaurantData;

    // 카테고리 필터
    if (filters.category !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.category === filters.category);
    }

    // 지역 필터
    if (filters.region !== 'all') {
      if (filters.region === 'seoul') {
        filtered = filtered.filter(restaurant => 
          restaurant.address.includes('서울시')
        );
      } else if (filters.region === 'bundang') {
        filtered = filtered.filter(restaurant => 
          restaurant.address.includes('성남시 분당구')
        );
      }
    }

    // 가격 필터
    if (filters.maxPrice !== 'all') {
      const maxPrice = parseInt(filters.maxPrice);
      filtered = filtered.filter(restaurant => {
        const price = extractPrice(restaurant.price);
        return price <= maxPrice;
      });
    }

    // 분위기 필터 (간단한 구현)
    if (filters.mood !== 'all') {
      if (filters.mood === 'solo') {
        filtered = filtered.filter(restaurant => 
          restaurant.category !== '양식' || restaurant.price.includes('1만원')
        );
      } else if (filters.mood === 'date') {
        filtered = filtered.filter(restaurant => 
          restaurant.category === '양식' || restaurant.category === '카페'
        );
      } else if (filters.mood === 'group') {
        filtered = filtered.filter(restaurant => 
          restaurant.parking.includes('가능')
        );
      }
    }

    return filtered;
  };

  // 랜덤 추천 생성
  const generateRandomRecommendation = () => {
    setIsLoading(true);
    
    // 로딩 애니메이션을 위한 지연
    setTimeout(() => {
      const filteredRestaurants = getFilteredRestaurants();
      
      if (filteredRestaurants.length === 0) {
        alert('조건에 맞는 맛집이 없습니다. 필터를 조정해보세요!');
        setIsLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
      const selectedRestaurant = filteredRestaurants[randomIndex];
      
      setCurrentRecommendation(selectedRestaurant);
      setIsLoading(false);
    }, 1500);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // 좋아요 버튼 클릭 (토글 기능)
  const handleLike = () => {
    if (currentRecommendation) {
      if (isInFavorites(currentRecommendation.id)) {
        removeFromFavorites(currentRecommendation.id);
        alert('찜 목록에서 제거되었습니다! 👋');
      } else {
        addToFavorites(currentRecommendation);
        alert('찜 목록에 추가되었습니다! 🎉');
      }
    }
  };

  // 길찾기 버튼 클릭
  const handleNavigate = () => {
    if (currentRecommendation) {
      const { lat, lng } = currentRecommendation.position;
      window.open(`https://map.kakao.com/link/to/${currentRecommendation.name},${lat},${lng}`, '_blank');
    }
  };

  // 별점 렌더링
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // 카테고리 아이콘
  const getCategoryIcon = (category) => {
    const icons = {
      '한식': '🍚',
      '양식': '🍝',
      '일식': '🍣',
      '중식': '🥢',
      '동남아식': '🍜',
      '카페': '☕'
    };
    return icons[category] || '🍽️';
  };

  return (
    <div className="random-recommendation-container">
      <div className="recommendation-header">
        <h1>🎲 오늘 뭐 먹지?</h1>
        <p>운명의 맛집을 찾아보세요!</p>
      </div>

      <div className="recommendation-content">
        {!currentRecommendation && !isLoading && (
          <div className="start-section">
            <div className="dice-container">
              <div className="dice">🎲</div>
              <button 
                className="random-button"
                onClick={generateRandomRecommendation}
              >
                랜덤 추천!
              </button>
            </div>
            
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '필터 숨기기' : '필터 설정'}
            </button>
          </div>
        )}

        {showFilters && (
          <div className="filters-section">
            <h3>🔍 필터 설정</h3>
            
            <div className="filter-group">
              <label>음식 종류:</label>
              <select 
                value={filters.category} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '전체' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>지역:</label>
              <select 
                value={filters.region} 
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                {regionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>가격대:</label>
              <select 
                value={filters.maxPrice} 
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              >
                {priceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>분위기:</label>
              <select 
                value={filters.mood} 
                onChange={(e) => handleFilterChange('mood', e.target.value)}
              >
                {moodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <div className="loading-animation">
              <div className="loading-dice">🎲</div>
              <div className="loading-text">운명의 맛집을 찾는 중...</div>
              <div className="loading-countdown">3... 2... 1...</div>
            </div>
          </div>
        )}

        {currentRecommendation && !isLoading && (
          <div className="recommendation-result">
            <div className="result-header">
              <h2>🍜 오늘의 추천!</h2>
            </div>
            
            <div className="restaurant-card">
              <div className="restaurant-header">
                <h3>{currentRecommendation.name}</h3>
                <span className="category-badge">
                  {getCategoryIcon(currentRecommendation.category)} {currentRecommendation.category}
                </span>
              </div>
              
              <div className="restaurant-rating">
                <div className="stars">
                  {renderStars(currentRecommendation.rating)}
                </div>
                <span className="rating-text">{currentRecommendation.rating}</span>
              </div>
              
              <div className="restaurant-info">
                <p className="address">📍 {currentRecommendation.address}</p>
                <p className="price">💰 {currentRecommendation.price}</p>
                <p className="hours">🕒 {currentRecommendation.hours}</p>
                <p className="phone">📞 {currentRecommendation.phone}</p>
                <p className="parking">🚗 {currentRecommendation.parking}</p>
              </div>
              
              <div className="restaurant-description">
                <p>{currentRecommendation.description}</p>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="action-btn dislike-btn"
                  onClick={generateRandomRecommendation}
                >
                  🔄 다른걸로!
                </button>
                <button 
                  className={`action-btn like-btn ${isInFavorites(currentRecommendation.id) ? 'favorited' : ''}`}
                  onClick={handleLike}
                >
                  {isInFavorites(currentRecommendation.id) ? '❤️ 찜됨' : '🤍 좋아요!'}
                </button>
                <button 
                  className="action-btn navigate-btn"
                  onClick={handleNavigate}
                >
                  🗺️ 길찾기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomRecommendation; 