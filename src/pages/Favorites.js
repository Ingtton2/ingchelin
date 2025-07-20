import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Favorites.css';

function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  console.log('Favorites 컴포넌트 렌더링:', { 
    favoritesCount: favorites.length, 
    currentUser: currentUser?.id,
    currentUserEmail: currentUser?.email,
    favorites: favorites.map(f => ({ id: f.id, name: f.name, cuisine: f.cuisine }))
  });
  const [userRatings, setUserRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // 사용자 평점 불러오기
  const loadUserRatings = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`http://localhost:8081/api/reviews/user/${currentUser.id}`);
      if (response.ok) {
        const reviews = await response.json();
        const ratingsMap = {};
        reviews.forEach(review => {
          ratingsMap[review.restaurant.id] = {
            ...ratingsMap[review.restaurant.id],
            [currentUser.id]: review.rating
          };
        });
        setUserRatings(ratingsMap);
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

  const getCategoryIcon = (category) => {
    if (!category) return '🍽️';
    const icons = {
      '한식': '🍚',
      '양식': '🍝',
      '일식': '🍣',
      '중식': '🥢',
      '동남아식': '🍜',
      '카페': '☕',
      '기타': '🍽️'
    };
    return icons[category] || '🍽️';
  };

  const getCategoryColor = (category) => {
    if (!category) return '#667eea';
    const colors = {
      '한식': '#FF6B6B',
      '양식': '#4ECDC4',
      '일식': '#45B7D1',
      '중식': '#96CEB4',
      '동남아식': '#FFEAA7',
      '카페': '#DDA0DD',
      '기타': '#667eea'
    };
    return colors[category] || '#667eea';
  };

  // 사용자 평점 처리
  const handleRating = async (restaurantId, rating) => {
    if (!currentUser) {
      alert('평점을 남기려면 로그인이 필요합니다.');
      return;
    }

    try {
      // 백엔드 API로 평점 저장
      const response = await fetch('http://localhost:8081/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          restaurantId: restaurantId,
          rating: rating,
          comment: `${rating}점 평가`
        })
      });

      if (response.ok) {
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
        alert('평점이 저장되었습니다! ⭐');
      } else {
        alert('평점 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('평점 저장 중 오류:', error);
      alert('평점 저장 중 오류가 발생했습니다.');
    }
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
                console.log('X 버튼 클릭됨:', restaurant.id, restaurant.name);
                
                // 사용자 확인
                if (window.confirm(`${restaurant.name}을 찜 목록에서 제거하시겠습니까?`)) {
                  removeFromFavorites(restaurant.id);
                }
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
                  <div className="category-badge" style={{ backgroundColor: getCategoryColor(restaurant.cuisine || restaurant.category) }}>
                    {getCategoryIcon(restaurant.cuisine || restaurant.category)} {restaurant.cuisine || restaurant.category || '기타'}
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