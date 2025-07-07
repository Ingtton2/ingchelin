import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import { restaurantData } from '../data/restaurantData';
import './RestaurantList.css';

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRatings, setUserRatings] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { currentUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();

  const categories = ['all', '한식', '양식', '일식', '중식', '동남아식', '카페'];

  useEffect(() => {
    // restaurantData에서 데이터를 가져와서 필요한 필드 추가
    const initialRestaurants = restaurantData.map(restaurant => ({
      ...restaurant,
      location: restaurant.position, // position을 location으로 매핑
      totalRatings: Math.floor(Math.random() * 200) + 50, // 랜덤 리뷰 수
      userRatings: {}
    }));

    // 로컬 스토리지에서 사용자 평점 불러오기
    const savedRatings = localStorage.getItem('userRatings');
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings));
    }

    setRestaurants(initialRestaurants);
  }, []);

  const handleRating = (restaurantId, rating) => {
    if (!currentUser) {
      alert('평점을 남기려면 로그인이 필요합니다.');
      return;
    }

    const newUserRatings = {
      ...userRatings,
      [restaurantId]: {
        ...userRatings[restaurantId],
        [currentUser.id]: rating
      }
    };

    setUserRatings(newUserRatings);
    localStorage.setItem('userRatings', JSON.stringify(newUserRatings));

    // 맛집의 평균 평점 업데이트
    setRestaurants(prev => prev.map(restaurant => {
      if (restaurant.id === restaurantId) {
        const allRatings = Object.values(newUserRatings[restaurantId] || {});
        const averageRating = allRatings.length > 0 
          ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length 
          : restaurant.rating;
        
        return {
          ...restaurant,
          rating: Math.round(averageRating * 10) / 10,
          totalRatings: allRatings.length
        };
      }
      return restaurant;
    }));
  };

  // 검색어와 카테고리로 필터링
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getUserRating = (restaurantId) => {
    if (!currentUser || !userRatings[restaurantId]) return 0;
    return userRatings[restaurantId][currentUser.id] || 0;
  };

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
    <div className="restaurant-list-container">
      {/* 검색창 */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 식당명, 카테고리, 주소로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-results-info">
            <p>"{searchTerm}" 검색 결과: {filteredRestaurants.length}개</p>
          </div>
        )}
      </div>

      <div className="category-nav">
        <div className="category-container">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="restaurant-grid">
        {filteredRestaurants.map(restaurant => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="restaurant-info">
              <div className="restaurant-header">
                <h3>{restaurant.name}</h3>
                <div className="category-badge">{restaurant.category}</div>
              </div>
              
              <div className="restaurant-details">
                <div className="rating-section">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= restaurant.rating ? 'star filled' : 'star'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">{restaurant.rating}</span>
                  <span className="total-ratings">({restaurant.totalRatings}개 리뷰)</span>
                </div>

                <div className="restaurant-meta">
                  <p className="address">📍 {restaurant.address}</p>
                  <p className="price">💰 {restaurant.price}</p>
                  <p className="hours">🕒 {restaurant.hours}</p>
                  <p className="phone">📞 {restaurant.phone}</p>
                  <p className="parking">🚗 {restaurant.parking}</p>
                </div>

                <p className="description">{restaurant.description}</p>
              </div>

              <div className="restaurant-actions">
                <button
                  className={`favorite-btn ${isInFavorites(restaurant.id) ? 'favorited' : ''}`}
                  onClick={() => {
                    if (isInFavorites(restaurant.id)) {
                      removeFromFavorites(restaurant.id);
                      alert('찜 목록에서 제거되었습니다! 👋');
                    } else {
                      addToFavorites(restaurant);
                      alert('찜 목록에 추가되었습니다! 🎉');
                    }
                  }}
                >
                  {isInFavorites(restaurant.id) ? '❤️ 찜됨' : '🤍 내 목록에 담기'}
                </button>
                
                <button
                  className="detail-btn"
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  📋 상세 정보
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 정보 모달 */}
      {selectedRestaurant && (
        <div className="modal-overlay" onClick={() => setSelectedRestaurant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRestaurant.name}</h2>
              <button className="close-btn" onClick={() => setSelectedRestaurant(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="restaurant-info-detail">
                <div className="info-row">
                  <span className="info-label">카테고리:</span>
                  <span className="info-value">{getCategoryIcon(selectedRestaurant.category)} {selectedRestaurant.category}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">평점:</span>
                  <span className="info-value">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= selectedRestaurant.rating ? 'star filled' : 'star'}>
                        ★
                      </span>
                    ))}
                    {selectedRestaurant.rating} ({selectedRestaurant.totalRatings}개 리뷰)
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">주소:</span>
                  <span className="info-value">{selectedRestaurant.address}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">가격대:</span>
                  <span className="info-value">{selectedRestaurant.price}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">영업시간:</span>
                  <span className="info-value">{selectedRestaurant.hours}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">전화번호:</span>
                  <span className="info-value">{selectedRestaurant.phone}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">주차:</span>
                  <span className="info-value">{selectedRestaurant.parking}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">설명:</span>
                  <span className="info-value">{selectedRestaurant.description}</span>
                </div>
              </div>

              <div className="rating-section-modal">
                <h3>평점 남기기</h3>
                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      className={`rating-btn ${getUserRating(selectedRestaurant.id) >= rating ? 'selected' : ''}`}
                      onClick={() => handleRating(selectedRestaurant.id, rating)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="rating-text-modal">
                  현재 평점: {getUserRating(selectedRestaurant.id)}점
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantList; 