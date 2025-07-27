import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
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
  const [showVisitConfirmModal, setShowVisitConfirmModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);

  // 사용자 평점 불러오기 (Supabase 직접 연결)
  const loadUserRatings = async () => {
    if (!currentUser) return;
    
    try {
      // Supabase에서 사용자 리뷰 가져오기
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('평점 불러오기 실패:', error);
        return;
      }
      
      const ratingsMap = {};
      reviews.forEach(review => {
        ratingsMap[review.restaurant_id] = {
          ...ratingsMap[review.restaurant_id],
          [currentUser.id]: review.rating
        };
      });
      setUserRatings(ratingsMap);
      console.log('Supabase에서 평점 로드 완료:', reviews.length, '개');
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

  // 사용자 평점 처리 (Supabase 직접 연결)
  const handleRatingSubmit = async (restaurantId, rating) => {
    if (!currentUser) {
      alert('평점을 남기려면 로그인이 필요합니다.');
      return;
    }

    console.log('평점 저장 시도:', { 
      currentUser: currentUser.id, 
      restaurantId: restaurantId, 
      rating: rating,
      restaurantIdType: typeof restaurantId,
      ratingType: typeof rating
    });

    try {
      // 데이터 타입 확인 및 변환
      const userId = parseInt(currentUser.id);
      const restaurantIdInt = parseInt(restaurantId);
      const ratingInt = parseInt(rating);

      if (isNaN(userId) || isNaN(restaurantIdInt) || isNaN(ratingInt)) {
        console.error('데이터 타입 오류:', { userId, restaurantIdInt, ratingInt });
        alert('데이터 형식이 올바르지 않습니다.');
        return;
      }

      console.log('변환된 데이터:', { userId, restaurantIdInt, ratingInt });

      // 기존 리뷰가 있는지 확인
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantIdInt)
        .single();

      console.log('기존 리뷰 확인 결과:', { existingReview, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('기존 리뷰 확인 실패:', checkError);
      }

      // 기존 리뷰가 있으면 업데이트, 없으면 새로 생성
      if (existingReview) {
        console.log('기존 리뷰 업데이트 시작');
        // 기존 리뷰 업데이트
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating: ratingInt,
            comment: `${ratingInt}점 평가`,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantIdInt);

        if (updateError) {
          console.error('리뷰 업데이트 실패:', updateError);
          alert(`평점 업데이트에 실패했습니다: ${updateError.message}`);
          return;
        }
        console.log('기존 리뷰 업데이트 완료');
      } else {
        console.log('새 리뷰 생성 시작');
        // 새 리뷰 생성 - 모든 필수 필드 포함
        const { error: insertError } = await supabase
          .from('reviews')
          .insert({
            user_id: userId,
            restaurant_id: restaurantIdInt,
            rating: ratingInt,
            comment: `${ratingInt}점 평가`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('리뷰 저장 실패:', insertError);
          console.error('에러 상세 정보:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          alert(`평점 저장에 실패했습니다: ${insertError.message}`);
          return;
        }
        console.log('새 리뷰 저장 완료');
      }

      // 방문 기록도 함께 저장 (중복 방지)
      console.log('방문 기록 확인 시작');
      const { data: existingVisit, error: visitCheckError } = await supabase
        .from('visits')
        .select('*')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantIdInt)
        .single();

      console.log('방문 기록 확인 결과:', { existingVisit, visitCheckError });

      if (visitCheckError && visitCheckError.code !== 'PGRST116') {
        console.error('기존 방문 기록 확인 실패:', visitCheckError);
      }

      if (!existingVisit) {
        console.log('새 방문 기록 생성 시작');
        // 방문 기록이 없으면 새로 생성 - 모든 필수 필드 포함
        const { error: visitError } = await supabase
          .from('visits')
          .insert({
            user_id: userId,
            restaurant_id: restaurantIdInt,
            rating: ratingInt,
            review: `${ratingInt}점 평가`,
            created_at: new Date().toISOString()
          });

        if (visitError) {
          console.error('방문 기록 저장 실패:', visitError);
          console.error('방문 기록 에러 상세 정보:', {
            code: visitError.code,
            message: visitError.message,
            details: visitError.details,
            hint: visitError.hint
          });
          // 방문 기록 실패는 경고만 표시하고 계속 진행
          console.warn('방문 기록 저장 실패했지만 리뷰는 저장됨');
        } else {
          console.log('방문 기록 저장 완료');
        }
      } else {
        console.log('기존 방문 기록 존재');
      }

      // 성공 시 상태 업데이트
      const newUserRatings = {
        ...userRatings,
        [restaurantId]: {
          ...userRatings[restaurantId],
          [currentUser.id]: ratingInt
        }
      };

      setUserRatings(newUserRatings);
      localStorage.setItem('userRatings', JSON.stringify(newUserRatings));
      setShowRatingModal(false);
      setSelectedRestaurant(null);
      alert('평점이 저장되었습니다! ⭐');
      console.log('Supabase에 평점 저장 완료');
    } catch (error) {
      console.error('평점 저장 중 예상치 못한 오류:', error);
      alert(`평점 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 별점 클릭 처리
  const handleRating = (restaurantId, rating) => {
    openVisitConfirmModal(restaurantId, rating);
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

export default Favorites; 