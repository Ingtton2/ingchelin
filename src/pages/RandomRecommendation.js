import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useVisit } from '../context/VisitContext';
import { restaurantAPI } from '../services/api';
import './RandomRecommendation.css';

const RandomRecommendation = () => {
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    categories: ['all'],
    regions: ['all'],
    priceRanges: ['all']
  });
  const [filters, setFilters] = useState({
    category: 'all',
    region: 'all',
    maxDistance: 'all',
    mood: 'all'
  });
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { getRestaurantVisitStatus } = useVisit();

  // 백엔드에서 레스토랑 데이터 가져오기
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAll();
        const restaurantsWithExtraData = response.data.map(restaurant => ({
          ...restaurant,
          category: restaurant.cuisine, // cuisine을 category로 매핑
          price: "2만원~5만원", // 임시 데이터
          parking: "주차 가능", // 임시 데이터
          position: { lat: restaurant.latitude, lng: restaurant.longitude }
        }));
        setRestaurants(restaurantsWithExtraData);
        
        // 필터 옵션 동적 생성
        generateFilterOptions(restaurantsWithExtraData);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      }
    };

    fetchRestaurants();
  }, []);

  // 데이터베이스에서 필터 옵션 동적 생성
  const generateFilterOptions = (restaurants) => {
    if (!restaurants.length) return;

    // 카테고리 옵션 생성
    const categories = ['all', ...new Set(restaurants.map(r => r.cuisine))];
    
    // 지역 옵션 생성 (시/구 단위로 그룹화)
    const regions = ['all'];
    const regionMap = {};
    
    restaurants.forEach(restaurant => {
      const addressParts = restaurant.address.split(' ');
      if (addressParts.length >= 2) {
        const region = `${addressParts[0]} ${addressParts[1]}`;
        if (!regionMap[region]) {
          regionMap[region] = 0;
          regions.push(region);
        }
        regionMap[region]++;
      }
    });



    // 거리 옵션
    const distanceOptions = [
      { value: 'all', label: '거리 무관' },
      { value: '1', label: '1km 이내' },
      { value: '2', label: '2km 이내' },
      { value: '3', label: '3km 이내' },
      { value: '5', label: '5km 이내' }
    ];

    // 분위기 옵션
    const moodOptions = [
      { value: 'all', label: '분위기 무관' },
      { value: 'solo', label: '혼밥 가능' },
      { value: 'date', label: '데이트 코스' },
      { value: 'group', label: '단체 모임' },
      { value: 'family', label: '가족 모임' }
    ];

    setFilterOptions({
      categories,
      regions,
      distanceOptions,
      moodOptions
    });
  };

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



  // 필터링된 레스토랑 목록 생성
  const getFilteredRestaurants = () => {
    let filtered = restaurants;

    // 카테고리 필터
    if (filters.category !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.cuisine === filters.category);
    }

    // 지역 필터
    if (filters.region !== 'all') {
      filtered = filtered.filter(restaurant => {
        return restaurant.address.includes(filters.region);
      });
    }



    // 분위기 필터 (실제 데이터 기반)
    if (filters.mood !== 'all') {
      if (filters.mood === 'solo') {
        filtered = filtered.filter(restaurant => 
          restaurant.cuisine === '한식' || restaurant.cuisine === '분식'
        );
      } else if (filters.mood === 'date') {
        filtered = filtered.filter(restaurant => 
          restaurant.cuisine === '양식' || restaurant.cuisine === '카페' || restaurant.cuisine === '일식'
        );
      } else if (filters.mood === 'group') {
        filtered = filtered.filter(restaurant => 
          restaurant.cuisine === '중식' || restaurant.cuisine === '한식'
        );
      } else if (filters.mood === 'family') {
        filtered = filtered.filter(restaurant => 
          restaurant.cuisine === '한식' || restaurant.cuisine === '중식'
        );
      }
    }

    return filtered;
  };

  // 랜덤 추천 생성
  const generateRandomRecommendation = async () => {
    setIsLoading(true);
    
    try {
      // 필터링된 레스토랑 목록 가져오기
      const filteredRestaurants = getFilteredRestaurants();
      
      if (filteredRestaurants.length === 0) {
        alert('선택한 필터 조건에 맞는 레스토랑이 없습니다. 필터를 조정해주세요.');
        setIsLoading(false);
        return;
      }
      
      // 필터링된 목록에서 랜덤 선택
      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
      const randomRestaurant = filteredRestaurants[randomIndex];
      
      // 추가 데이터 매핑
      const restaurantWithExtraData = {
        ...randomRestaurant,
        category: randomRestaurant.cuisine,
        price: "2만원~5만원",
        parking: "주차 가능",
        position: { lat: randomRestaurant.latitude, lng: randomRestaurant.longitude }
      };
      
      setCurrentRecommendation(restaurantWithExtraData);
    } catch (err) {
      console.error('Failed to get random restaurant:', err);
      alert('랜덤 추천을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
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
      } else {
        addToFavorites(currentRecommendation);
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
      '카페': '☕',
      '디저트': '🍰',
      '분식': '🍡',
      '술': '🍺',
      '태국': '🍜'
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
                {filterOptions.categories.map(cat => (
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
                {filterOptions.regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? '전체 지역' : region}
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
                {filterOptions.moodOptions.map(option => (
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