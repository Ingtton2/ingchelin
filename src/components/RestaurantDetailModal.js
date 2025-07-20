import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import './RestaurantDetailModal.css';

const RestaurantDetailModal = ({ restaurant, onClose, onRating }) => {
  const { currentUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  // 드래그 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setModalPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  if (!restaurant) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="modal-header">
          <h2>{restaurant.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="restaurant-info-detail">
            <div className="info-row">
              <span className="info-label">카테고리:</span>
              <span className="info-value">{getCategoryIcon(restaurant.category)} {restaurant.category}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">평점:</span>
              <span className="info-value">
                {renderStars(restaurant.rating)}
                {restaurant.rating} ({restaurant.totalRatings || 0}개 리뷰)
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">주소:</span>
              <span className="info-value">{restaurant.address}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">가격대:</span>
              <span className="info-value">{restaurant.price}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">영업시간:</span>
              <span className="info-value">{restaurant.businessHours}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">전화번호:</span>
              <span className="info-value">{restaurant.phone}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">주차:</span>
              <span className="info-value">{restaurant.parking}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">설명:</span>
              <span className="info-value">{restaurant.description}</span>
            </div>
          </div>

          <div className="modal-actions">
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
                onClose();
              }}
            >
              {isInFavorites(restaurant.id) ? '❤️ 찜됨' : '🤍 찜하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal; 