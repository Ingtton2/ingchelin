import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import LocationBasedRecommendation from '../components/LocationBasedRecommendation';
import { restaurantAPI } from '../services/api';
import './Home.css';

function Home() {
  const { currentUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드 서버 상태와 DB 연결 상태 확인 (랜딩페이지 로드 완료 후)
  useEffect(() => {
    // 페이지 로드 완료 후 2초 뒤에 상태 체크
    const statusCheckTimer = setTimeout(async () => {
      const checkServerStatus = async () => {
        try {
          // 백엔드 서버 상태 확인
          const serverResponse = await fetch('http://localhost:8080/api/restaurants');
          const isServerRunning = serverResponse.ok;
          
          // 데이터베이스 연결 상태 확인 (레스토랑 데이터가 있는지 확인)
          let isDbConnected = false;
          let restaurantCount = 0;
          let restaurantData = [];
          
          if (isServerRunning) {
            restaurantData = await serverResponse.json();
            restaurantCount = restaurantData.length;
            isDbConnected = restaurantCount > 0;
          }
          
          // 상태 알림
          let statusMessage = '';
          if (isServerRunning && isDbConnected) {
            statusMessage = `✅ 서버 상태: 정상\n✅ 데이터베이스 연결: 정상\n📊 레스토랑 데이터: ${restaurantCount}개`;
          } else if (isServerRunning && !isDbConnected) {
            statusMessage = `✅ 서버 상태: 정상\n❌ 데이터베이스 연결: 실패\n📊 레스토랑 데이터: ${restaurantCount}개`;
          } else {
            statusMessage = `❌ 서버 상태: 실패\n❌ 데이터베이스 연결: 실패\n📊 레스토랑 데이터: 0개`;
          }
          
          alert(statusMessage);
          
          // 레스토랑 데이터 로드
          if (isServerRunning && restaurantData.length > 0) {
            // 방문 수 데이터 가져오기
            const visitCountsResponse = await fetch('http://localhost:8080/api/visits/count/all');
            let visitCounts = {};
            if (visitCountsResponse.ok) {
              visitCounts = await visitCountsResponse.json();
            }
            
            // 평점이 높은 순으로 정렬하여 상위 3개 선택
            const sortedRestaurants = restaurantData
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map(restaurant => ({
                ...restaurant,
                totalRatings: visitCounts[restaurant.id] || 0,
                price: "2만원~5만원",
                businessHours: "11:00 - 22:00",
                position: { 
                  lat: restaurant.latitude || 37.5665, 
                  lng: restaurant.longitude || 126.9780 
                }
              }));
            setTopRestaurants(sortedRestaurants);
          } else {
            setError('서버에 연결할 수 없습니다.');
          }
        } catch (err) {
          console.error('Failed to check server status:', err);
          alert('❌ 서버 상태 확인 실패\n❌ 데이터베이스 연결: 확인 불가\n📊 레스토랑 데이터: 0개');
          setError('서버에 연결할 수 없습니다.');
        } finally {
          setLoading(false);
        }
      };

      checkServerStatus();
    }, 2000); // 2초 후 실행

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(statusCheckTimer);
  }, []);

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
    } else {
      addToFavorites(restaurant);
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
    if (lat && lng) {
      window.open(`https://map.kakao.com/link/to/${restaurant.name},${lat},${lng}`, '_blank');
    } else {
      alert('위치 정보가 없어 길찾기를 할 수 없습니다.');
    }
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
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
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
                <div className="total-ratings">({restaurant.totalRatings}명 방문)</div>
              </div>
              
              <div className="description">{restaurant.description}</div>
              
              <div className="restaurant-meta">
                <p>📍 {restaurant.address}</p>

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
        )}
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