import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import LocationBasedRecommendation from '../components/LocationBasedRecommendation';
import './Home.css';

function Home() {
  const { currentUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const features = [
    {
      icon: '🍽️',
      title: '다양한 맛집',
      description: '한식, 양식, 일식, 중식 등 다양한 종류의 맛집을 소개합니다.'
    },
    {
      icon: '⭐',
      title: '실시간 평점',
      description: '사용자들이 직접 남긴 평점으로 신뢰할 수 있는 맛집 정보를 제공합니다.'
    },
    {
      icon: '🗺️',
      title: '지도 서비스',
      description: '지도에서 맛집 위치를 한눈에 확인하고 편리하게 찾아갈 수 있습니다.'
    },
    {
      icon: '🔍',
      title: '카테고리별 검색',
      description: '음식 종류별로 필터링하여 원하는 맛집을 쉽게 찾을 수 있습니다.'
    }
  ];

  const topRestaurants = [
    {
      id: 1,
      name: "스테이크 하우스",
      category: "양식",
      rating: 4.9,
      totalRatings: 128,
      description: "최고급 스테이크와 와인을 즐길 수 있는 고급 레스토랑입니다.",
      price: "8만원~15만원",
      address: "서울시 강남구 압구정로 678",
      businessHours: "11:00 - 22:00",
      phone: "02-1234-5678",
      parking: "주차 가능",
      position: { lat: 37.5270, lng: 127.0276 }
    },
    {
      id: 2,
      name: "스시 마스터",
      category: "일식",
      rating: 4.9,
      totalRatings: 95,
      description: "신선한 재료로 만드는 정통 스시와 사시미를 즐길 수 있습니다.",
      price: "4만원~8만원",
      address: "서울시 마포구 홍대로 789",
      businessHours: "11:30 - 21:30",
      phone: "02-2345-6789",
      parking: "주차 불가",
      position: { lat: 37.5519, lng: 126.9251 }
    },
    {
      id: 3,
      name: "프랑스 브라서리",
      category: "양식",
      rating: 4.8,
      totalRatings: 156,
      description: "정통 프랑스 요리와 와인을 즐길 수 있는 고급 레스토랑입니다.",
      price: "5만원~10만원",
      address: "서울시 강남구 청담대로 789",
      businessHours: "12:00 - 23:00",
      phone: "02-3456-7890",
      parking: "주차 가능",
      position: { lat: 37.5270, lng: 127.0276 }
    }
  ];

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

  // 찜하기 버튼 클릭 핸들러 (토글 기능)
  const handleFavorite = (restaurant) => {
    if (isInFavorites(restaurant.id)) {
      removeFromFavorites(restaurant.id);
      alert('찜 목록에서 제거되었습니다! 👋');
    } else {
      addToFavorites(restaurant);
      alert('찜 목록에 추가되었습니다! 🎉');
    }
  };

  // 상세보기 버튼 클릭 핸들러
  const handleDetail = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedRestaurant(null);
  };

  // 길찾기 버튼 클릭 핸들러
  const handleNavigate = (restaurant) => {
    const { lat, lng } = restaurant.position;
    window.open(`https://map.kakao.com/link/to/${restaurant.name},${lat},${lng}`, '_blank');
  };

  return (
    <div className="home-container">
      {/* 헤더 섹션 */}
      <section className="home-header">
        <h1>🍽️ 인슐랭 맛집 가이드에 오신 것을 환영합니다!</h1>
        <p>최고의 맛집들을 발견하고, 평점을 남기고, 지도에서 위치를 확인하세요.</p>
        {!currentUser ? (
          <div className="home-actions">
            <Link to="/signup" className="home-btn">✍️ 회원가입</Link>
            <Link to="/login" className="home-btn secondary">🔑 로그인</Link>
          </div>
        ) : (
          <div className="home-actions">
            <Link to="/restaurants" className="home-btn">📋 맛집 둘러보기</Link>
            <Link to="/map" className="home-btn secondary">🗺️ 지도 보기</Link>
          </div>
        )}
      </section>

      {/* 위치 기반 추천 섹션 */}
      <section className="location-recommendations">
        <LocationBasedRecommendation />
      </section>

      {/* TOP 3 맛집 섹션 */}
      <section className="recommendations-section">
        <h2>주인장 추천 식당 TOP 3</h2>
        <div className="recommendations-grid">
          {topRestaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="recommendation-card">
              <div className="recommendation-header">
                <h3>{restaurant.name}</h3>
                <div className="rank-badge">#{index + 1}</div>
              </div>
              
              <div className="rating-section">
                <div className="stars">
                  {renderStars(restaurant.rating)}
                </div>
                <div className="rating-text">{restaurant.rating}</div>
                <div className="total-ratings">({restaurant.totalRatings}명)</div>
              </div>
              
              <div className="description">{restaurant.description}</div>
              
              <div className="restaurant-meta">
                <p>📍 {restaurant.address}</p>
                <p>💰 {restaurant.price}</p>
                <p>🕒 {restaurant.businessHours}</p>
                <p>📞 {restaurant.phone}</p>
                <p>🚗 {restaurant.parking}</p>
              </div>
              
              <div className="recommendation-actions">
                <button 
                  className={`favorite-btn ${isInFavorites(restaurant.id) ? 'favorited' : ''}`}
                  onClick={() => handleFavorite(restaurant)}
                >
                  {isInFavorites(restaurant.id) ? '❤️ 찜됨' : '🤍 내 목록에 담기'}
                </button>
                <button 
                  className="detail-btn"
                  onClick={() => handleDetail(restaurant)}
                >
                  📋 상세보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 상세보기 모달 */}
      {showModal && selectedRestaurant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRestaurant.name}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="restaurant-info">
                <div className="rating-section">
                  <div className="stars">
                    {renderStars(selectedRestaurant.rating)}
                  </div>
                  <div className="rating-text">{selectedRestaurant.rating}</div>
                  <div className="total-ratings">({selectedRestaurant.totalRatings}명)</div>
                </div>
                
                <div className="restaurant-details">
                  <p><strong>📍 주소:</strong> {selectedRestaurant.address}</p>
                  <p><strong>💰 가격대:</strong> {selectedRestaurant.price}</p>
                  <p><strong>🕒 영업시간:</strong> {selectedRestaurant.businessHours}</p>
                  <p><strong>📞 전화번호:</strong> {selectedRestaurant.phone}</p>
                  <p><strong>🚗 주차:</strong> {selectedRestaurant.parking}</p>
                </div>
                
                <div className="restaurant-description">
                  <p><strong>📝 소개:</strong></p>
                  <p>{selectedRestaurant.description}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className={`modal-btn favorite-btn ${isInFavorites(selectedRestaurant.id) ? 'favorited' : ''}`}
                onClick={() => handleFavorite(selectedRestaurant)}
              >
                {isInFavorites(selectedRestaurant.id) ? '❤️ 찜됨' : '🤍 찜하기'}
              </button>
              <button 
                className="modal-btn navigate-btn"
                onClick={() => handleNavigate(selectedRestaurant)}
              >
                🗺️ 길찾기
              </button>
              <button 
                className="modal-btn close-btn"
                onClick={closeModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home; 