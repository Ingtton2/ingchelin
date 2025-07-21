import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import { restaurantAPI } from '../services/api';

import './RestaurantList.css';

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRatings, setUserRatings] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVisitConfirmModal, setShowVisitConfirmModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);
  const { currentUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();

  const categories = ['all', '한식', '중식', '일식', '양식', '분식', '태국', '술', '카페', '디저트'];

  // 사용자 평점 불러오기 (로컬 스토리지 사용)
  const loadUserRatings = async () => {
    if (!currentUser) return;
    
    try {
      // 로컬 스토리지에서 사용자 평점 불러오기
      const savedRatings = localStorage.getItem('userRatings');
      if (savedRatings) {
        setUserRatings(JSON.parse(savedRatings));
      }
    } catch (error) {
      console.error('평점 불러오기 실패:', error);
    }
  };

  // 사용자 로그인 시 평점 불러오기
  useEffect(() => {
    if (currentUser) {
      loadUserRatings();
    } else {
      setUserRatings({});
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await restaurantAPI.getAll();
        
        const restaurantsWithExtraData = data.map(restaurant => ({
          ...restaurant,
          category: restaurant.cuisine, // cuisine을 category로 매핑
          location: { lat: restaurant.latitude, lng: restaurant.longitude }, // position을 location으로 매핑
          totalRatings: 0, // 임시 데이터
          price: "2만원~5만원", // 임시 데이터
          hours: "11:00 - 22:00", // 임시 데이터
          userRatings: {}
        }));

        // 로컬 스토리지에서 사용자 평점 불러오기
        const savedRatings = localStorage.getItem('userRatings');
        if (savedRatings) {
          setUserRatings(JSON.parse(savedRatings));
        }

        setRestaurants(restaurantsWithExtraData);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setError('레스토랑 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // 방문 확인 모달 열기
  const openVisitConfirmModal = (restaurantId, rating) => {
    setPendingRating({ restaurantId, rating });
    setShowVisitConfirmModal(true);
  };

  // 방문 확인 처리
  const handleVisitConfirm = async (hasVisited) => {
    setShowVisitConfirmModal(false);
    
    if (!hasVisited) {
      alert('방문하지 않은 맛집에는 별점을 매길 수 없습니다.\n\n먼저 맛집을 방문해보세요! 🍽️');
      return;
    }

    // 방문했다면 평점 저장 진행
    await handleRatingSubmit(pendingRating.restaurantId, pendingRating.rating);
    setPendingRating(null);
  };

  // 사용자 평점 처리 (로컬 스토리지 사용)
  const handleRatingSubmit = async (restaurantId, rating) => {
    if (!currentUser) {
      alert('평점을 남기려면 로그인이 필요합니다.');
      return;
    }

    try {
      // 로컬 스토리지에 방문 기록 저장
      const visits = JSON.parse(localStorage.getItem('visits') || '[]');
      visits.push({
        userId: currentUser.id,
        restaurantId: restaurantId,
        visitDate: new Date().toISOString(),
        rating: rating,
        comment: `${rating}점 평가`
      });
      localStorage.setItem('visits', JSON.stringify(visits));

      // 로컬 스토리지에 평점 저장
      const newUserRatings = {
        ...userRatings,
        [restaurantId]: {
          ...userRatings[restaurantId],
          [currentUser.id]: rating
        }
      };

      setUserRatings(newUserRatings);
      localStorage.setItem('userRatings', JSON.stringify(newUserRatings));
      alert('평점과 방문 기록이 저장되었습니다! ⭐');
    } catch (error) {
      console.error('평점 저장 중 오류:', error);
      alert('평점 저장 중 오류가 발생했습니다.');
    }
  };

  // 별점 클릭 처리
  const handleRating = (restaurantId, rating) => {
    openVisitConfirmModal(restaurantId, rating);
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
      '카페': '☕',
      '디저트': '🍰',
      '분식': '🍡',
      '술': '🍺',
      '태국': '🍜'
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

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
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
                  <span className="total-ratings">({restaurant.totalRatings}명 방문)</span>
                </div>

                <div className="restaurant-meta">
                  <p className="address">📍 {restaurant.address}</p>

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
                    } else {
                      addToFavorites(restaurant);
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
      )}

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
                    {selectedRestaurant.rating} ({selectedRestaurant.totalRatings}명 방문)
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

      {/* 방문 확인 모달 */}
      {showVisitConfirmModal && (
        <div className="visit-confirm-modal">
          <div className="visit-confirm-modal-content">
            <div className="visit-confirm-modal-header">
              <h3>방문 확인</h3>
            </div>
            <div className="visit-confirm-modal-body">
              <p>이 맛집을 방문하셨나요?</p>
              <p className="visit-note">방문하지 않았다면 별점을 매길 수 없습니다.</p>
            </div>
            <div className="visit-confirm-modal-actions">
              <button 
                className="visit-confirm-btn yes"
                onClick={() => handleVisitConfirm(true)}
              >
                네
              </button>
              <button 
                className="visit-confirm-btn no"
                onClick={() => handleVisitConfirm(false)}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantList; 