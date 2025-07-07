import React, { useState } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Favorites.css';

function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userRatings, setUserRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  const getCategoryColor = (category) => {
    const colors = {
      '한식': '#FF6B6B',
      '양식': '#4ECDC4',
      '일식': '#45B7D1',
      '중식': '#96CEB4',
      '동남아식': '#FFEAA7',
      '카페': '#DDA0DD'
    };
    return colors[category] || '#667eea';
  };

  // 사용자 평점 처리
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
    setShowRatingModal(false);
    setSelectedRestaurant(null);
  };

  // 사용자 평점 가져오기
  const getUserRating = (restaurantId) => {
    if (!currentUser || !userRatings[restaurantId]) return 0;
    return userRatings[restaurantId][currentUser.id] || 0;
  };

  // 평가 모달 열기
  const openRatingModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowRatingModal(true);
  };

  // 지도 페이지로 이동 (특정 식당 위치로)
  const goToMap = (restaurant) => {
    // 식당에 location 정보가 있는지 확인 (맛집 목록에서는 location 사용)
    if (restaurant.location && restaurant.location.lat && restaurant.location.lng) {
      // 식당 정보를 URL 파라미터로 전달
      navigate(`/map?restaurant=${restaurant.id}&lat=${restaurant.location.lat}&lng=${restaurant.location.lng}`);
    } else if (restaurant.position && restaurant.position.lat && restaurant.position.lng) {
      // position 정보가 있는 경우 (지도 페이지에서 사용)
      navigate(`/map?restaurant=${restaurant.id}&lat=${restaurant.position.lat}&lng=${restaurant.position.lng}`);
    } else {
      // 위치 정보가 없으면 기본 지도 페이지로 이동
      navigate('/map');
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <div className="favorites-header">
          <h2>💖 내 찜 목록</h2>
          <p>마음에 드는 맛집을 찜해보세요!</p>
        </div>
        <div className="empty-favorites">
          <div className="empty-icon">💔</div>
          <h3>아직 찜한 맛집이 없어요</h3>
          <p>맛집 목록에서 "내 목록에 담기" 버튼을 눌러서<br />마음에 드는 맛집을 찜해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>💖 내 찜 목록</h2>
        <p>총 {favorites.length}개의 맛집을 찜하셨네요!</p>
      </div>

      <div className="favorites-grid">
        {favorites.map((restaurant) => (
          <div key={restaurant.id} className="favorite-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="remove-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFromFavorites(restaurant.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="찜 목록에서 제거"
              aria-label={`${restaurant.name}을 찜 목록에서 제거`}
            >
              ❌
            </button>
            <div className="card-header">
              <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <div className="category-badge" style={{ backgroundColor: getCategoryColor(restaurant.category) }}>
                  {getCategoryIcon(restaurant.category)} {restaurant.category}
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="rating">
                <span className="stars">★★★★★</span>
                <span className="rating-number">{restaurant.rating}</span>
              </div>
              
              <p className="description">{restaurant.description}</p>
              
              <div className="details">
                <p className="address">📍 {restaurant.address}</p>
                <p className="price">💰 {restaurant.price}</p>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="view-map-btn"
                onClick={() => goToMap(restaurant)}
              >
                🗺️ 지도에서 보기
              </button>
              <button 
                className="rating-btn"
                onClick={() => openRatingModal(restaurant)}
              >
                ⭐ 평가하기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 평가 모달 */}
      {showRatingModal && selectedRestaurant && (
        <div className="rating-modal">
          <div className="rating-modal-content">
            <div className="rating-modal-header">
              <h3>{selectedRestaurant.name} 평가하기</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedRestaurant(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="rating-modal-body">
              <div className="restaurant-info-modal">
                <div className="category-badge" style={{ backgroundColor: getCategoryColor(selectedRestaurant.category) }}>
                  {getCategoryIcon(selectedRestaurant.category)} {selectedRestaurant.category}
                </div>
                <p className="description">{selectedRestaurant.description}</p>
                <div className="details">
                  <p className="address">📍 {selectedRestaurant.address}</p>
                  <p className="price">💰 {selectedRestaurant.price}</p>
                </div>
              </div>
              
              <div className="rating-section">
                <h4>별점 평가</h4>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star-btn ${getUserRating(selectedRestaurant.id) >= star ? 'filled' : ''}`}
                      onClick={() => handleRating(selectedRestaurant.id, star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="rating-text">
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

export default Favorites; 