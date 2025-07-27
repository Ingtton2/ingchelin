import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { supabase } from '../services/supabase';
import { restaurantData } from '../data/restaurantData';

const LocationBasedRecommendation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();

  // 두 지점 간의 거리 계산 (하버사인 공식)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // km
    return distance;
  };

  // Supabase에서 레스토랑 데이터 가져오기
  const fetchRestaurants = async () => {
    try {
      // Supabase에서 레스토랑 데이터 가져오기
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');
      
      if (error) {
        console.warn('Supabase 연결 실패, 기본 데이터 사용:', error);
        // 기본 데이터 반환
        return restaurantData.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.category,
          rating: restaurant.rating,
          address: restaurant.address,
          description: restaurant.description,
          latitude: restaurant.position.lat,
          longitude: restaurant.position.lng,
          phone: restaurant.phone,
          parking: restaurant.parking,
          businessHours: restaurant.hours,
          totalRatings: Math.floor(Math.random() * 100) + 10 // 임시 데이터
        }));
      }
      
      // Supabase 데이터가 있으면 사용, 없으면 기본 데이터 사용
      if (data && data.length > 0) {
        console.log('Supabase 데이터 사용:', data.length, '개 레스토랑');
        return data.map(restaurant => ({
          ...restaurant,
          totalRatings: Math.floor(Math.random() * 100) + 10 // 임시 데이터
        }));
      } else {
        console.log('Supabase 데이터 없음, 기본 데이터 사용');
        return restaurantData.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.category,
          rating: restaurant.rating,
          address: restaurant.address,
          description: restaurant.description,
          latitude: restaurant.position.lat,
          longitude: restaurant.position.lng,
          phone: restaurant.phone,
          parking: restaurant.parking,
          businessHours: restaurant.hours,
          totalRatings: Math.floor(Math.random() * 100) + 10 // 임시 데이터
        }));
      }
    } catch (error) {
      console.warn('API 호출 실패, 기본 데이터 사용:', error);
      return restaurantData.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.category,
        rating: restaurant.rating,
        address: restaurant.address,
        description: restaurant.description,
        latitude: restaurant.position.lat,
        longitude: restaurant.position.lng,
        phone: restaurant.phone,
        parking: restaurant.parking,
        businessHours: restaurant.hours,
        totalRatings: Math.floor(Math.random() * 100) + 10 // 임시 데이터
      }));
    }
  };

  // 사용자 위치 가져오기
  const getUserLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Supabase에서 레스토랑 데이터 가져오기
          const restaurants = await fetchRestaurants();
          
          // 가까운 식당 찾기 (위도/경도가 있는 경우만)
          const restaurantsWithDistance = restaurants
            .filter(restaurant => restaurant.latitude && restaurant.longitude)
            .map(restaurant => {
              const distance = calculateDistance(
                latitude, 
                longitude, 
                restaurant.latitude, 
                restaurant.longitude
              );
              return {
                ...restaurant,
                distance: distance,
                position: { lat: restaurant.latitude, lng: restaurant.longitude },
                businessHours: restaurant.businessHours || "11:00 - 22:00",
              };
            });

          // 위도/경도가 없는 경우 기본 위치 데이터 추가
          const restaurantsWithoutLocation = restaurants
            .filter(restaurant => !restaurant.latitude || !restaurant.longitude)
            .map(restaurant => ({
              ...restaurant,
              distance: Math.random() * 10 + 1, // 임시 거리 (1-11km)
              position: restaurant.position || { lat: 37.5665, lng: 126.9780 }, // 기존 position 사용 또는 기본값
              businessHours: restaurant.businessHours || "11:00 - 22:00",
            }));

          const allRestaurants = [...restaurantsWithDistance, ...restaurantsWithoutLocation];

          // 거리순으로 정렬 (가까운 순) - 3개만 추천
          const sortedRestaurants = allRestaurants
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3); // 상위 3개만 추천

          console.log('주변 맛집 추천:', sortedRestaurants);
          setNearbyRestaurants(sortedRestaurants);
          setLoading(false);
        } catch (error) {
          console.error('레스토랑 정보 로딩 오류:', error);
          setError('레스토랑 정보를 불러오는데 실패했습니다.');
          setLoading(false);
        }
      },
      (error) => {
        let errorMessage = '위치 정보를 가져올 수 없습니다.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  };

  // 페이지 로드 시 자동으로 위치 가져오기
  useEffect(() => {
    getUserLocation();
  }, []);

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
    if (lat && lng) {
      window.open(`https://map.kakao.com/link/to/${restaurant.name},${lat},${lng}`, '_blank');
    } else {
      alert('위치 정보가 없어 길찾기를 할 수 없습니다.');
    }
  };

  return (
    <div>
      <h2>📍 내 주변 맛집 추천</h2>
      <p>현재 위치를 기반으로 가까운 맛집을 추천해드립니다!</p>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>위치를 확인하고 있습니다...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button 
            className="location-btn"
            onClick={getUserLocation}
          >
            다시 시도
          </button>
        </div>
      )}

      {userLocation && nearbyRestaurants.length > 0 && (
        <div className="nearby-grid">
          {nearbyRestaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="nearby-card">
              <div className="nearby-header">
                <h4>{restaurant.name}</h4>
                <div className="distance">{restaurant.distance.toFixed(1)}km</div>
              </div>
              
              <div className="rating-section">
                <div className="stars">
                  {renderStars(restaurant.rating)}
                </div>
                <div className="rating-text">{restaurant.rating}</div>
                <div className="total-ratings">({restaurant.totalRatings || 0}명)</div>
              </div>
              
              <div className="description">{restaurant.description}</div>
              
              <div className="restaurant-meta">
                <p>📍 {restaurant.address}</p>
                <p>🕒 {restaurant.businessHours}</p>
                <p>📞 {restaurant.phone}</p>
                <p>🚗 {restaurant.parking ? '주차 가능' : '주차 불가'}</p>
              </div>
              
              <div className="nearby-actions">
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
                  <div className="total-ratings">({selectedRestaurant.totalRatings || 0}명)</div>
                </div>
                
                <div className="distance-info">
                  <p><strong>📍 거리:</strong> {selectedRestaurant.distance.toFixed(1)}km</p>
                </div>
                
                <div className="restaurant-details">
                  <p><strong>📍 주소:</strong> {selectedRestaurant.address}</p>
                  <p><strong>🕒 영업시간:</strong> {selectedRestaurant.businessHours}</p>
                  <p><strong>📞 전화번호:</strong> {selectedRestaurant.phone}</p>
                  <p><strong>🚗 주차:</strong> {selectedRestaurant.parking ? '주차 가능' : '주차 불가'}</p>
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
};

export default LocationBasedRecommendation; 