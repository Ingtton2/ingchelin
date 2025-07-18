import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { useVisit } from '../context/VisitContext';
import { useSearchParams } from 'react-router-dom';
import { restaurantData } from '../data/restaurantData';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import './Map.css';

function KakaoMap() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { getRestaurantVisitStatus, setRestaurantVisitStatus } = useVisit();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [userMarker, setUserMarker] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchParams] = useSearchParams();
  const [mapInstance, setMapInstance] = useState(null);
  
  // 새로운 상태들
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['한식', '양식', '일식', '중식', '동남아식', '카페']);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  
  // 마커 상태 추가
  const [markers, setMarkers] = useState([]);
  const [labels, setLabels] = useState([]);
  
  // 마커 상태 필터 추가
  const [selectedMarkerStatus, setSelectedMarkerStatus] = useState(['favorited', 'liked', 'disliked', 'not-visited']);
  
  // 미니 팝업 상태 추가
  const [miniPopup, setMiniPopup] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 상세정보 모달 상태 추가
  const [detailModal, setDetailModal] = useState(null);

  // 드래그 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - popupPosition.x,
      y: e.clientY - popupPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPopupPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 카테고리 옵션
  const categories = ['한식', '양식', '일식', '중식', '동남아식', '카페'];
  
  // 마커 상태 옵션
  const markerStatusOptions = [
    { value: 'favorited', label: '찜한 맛집', color: '#FF3B30', icon: '❤️' },
    { value: 'liked', label: '방문한 곳 (좋았던 곳)', color: '#007AFF', icon: '👍' },
    { value: 'disliked', label: '방문한 곳 (별로인 곳)', color: '#8E8E93', icon: '👎' },
    { value: 'not-visited', label: '안 가본 곳', color: '#FF6B6B', icon: '❓' }
  ];

  // 검색 및 필터링 함수
  useEffect(() => {
    let filtered = restaurantData;
    
    // 검색어 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 카테고리 필터링
    filtered = filtered.filter(restaurant => 
      selectedCategories.includes(restaurant.category)
    );
    
    // 마커 상태 필터링
    filtered = filtered.filter(restaurant => {
      if (isInFavorites(restaurant.id)) {
        return selectedMarkerStatus.includes('favorited');
      } else {
        const visitStatus = getRestaurantVisitStatus(restaurant.id);
        if (visitStatus === 'liked') {
          return selectedMarkerStatus.includes('liked');
        } else if (visitStatus === 'disliked') {
          return selectedMarkerStatus.includes('disliked');
        } else {
          return selectedMarkerStatus.includes('not-visited');
        }
      }
    });
    
    setFilteredRestaurants(filtered);
    setRestaurants(filtered);
  }, [searchQuery, selectedCategories, selectedMarkerStatus]);

  // 마커 업데이트 함수
  const updateMapMarkers = (restaurantsToShow) => {
    if (!mapInstance) return;

    // 기존 마커와 라벨 제거
    markers.forEach(marker => marker.setMap(null));
    labels.forEach(label => label.setMap(null));

    const newMarkers = [];
    const newLabels = [];

    // 새로운 마커와 라벨 추가
    restaurantsToShow.forEach((restaurant) => {
      // 마커 색상 결정
      let markerColor = '#FF6B6B'; // 기본 색상
      let markerIcon = getCategoryIcon(restaurant.category);
      
      // 상태별 색상 적용
      if (isInFavorites(restaurant.id)) {
        markerColor = '#FF3B30'; // 찜한 맛집 - 빨간색
      } else {
        const visitStatus = getRestaurantVisitStatus(restaurant.id);
        if (visitStatus === 'liked') {
          markerColor = '#007AFF'; // 방문한 곳 (좋았던 곳) - 파란색
        } else if (visitStatus === 'disliked') {
          markerColor = '#8E8E93'; // 방문한 곳 (별로인 곳) - 회색
        }
      }

      // 카테고리별 아이콘과 색상으로 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(restaurant.position.lat, restaurant.position.lng),
        image: new window.kakao.maps.MarkerImage(
          createMarkerImage(markerColor, markerIcon),
          new window.kakao.maps.Size(40, 40)
        )
      });
      
      marker.setMap(mapInstance);
      newMarkers.push(marker);
      
      // 마커 위에 식당 이름만 표시하는 커스텀 오버레이
      const content = `
        <div class="marker-label">
          <div class="marker-label-content">
            ${restaurant.name}
          </div>
        </div>
      `;
      
      const label = new window.kakao.maps.CustomOverlay({
        content: content,
        position: new window.kakao.maps.LatLng(restaurant.position.lat, restaurant.position.lng),
        xAnchor: 0.5,
        yAnchor: 1.5
      });
      
      label.setMap(mapInstance);
      newLabels.push(label);
      
      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedRestaurant(restaurant);
        
        // 미니 팝업 표시 - 지도 컨테이너 내 상대적 위치로 계산
        const position = new window.kakao.maps.LatLng(restaurant.position.lat, restaurant.position.lng);
        const projection = mapInstance.getProjection();
        const point = projection.pointFromCoords(position);
        
        setMiniPopup(restaurant);
        setPopupPosition({
          x: point.x,
          y: point.y - 80 // 마커 위에 표시
        });
      });
    });

    setMarkers(newMarkers);
    setLabels(newLabels);
  };

  // 마커 이미지 생성 함수
  const createMarkerImage = (color, icon) => {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // 원형 배경 그리기
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 아이콘 텍스트 그리기
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 20, 20);
    
    return canvas.toDataURL();
  };

  // 필터링된 레스토랑이 변경될 때 마커 업데이트
  useEffect(() => {
    if (mapLoaded && mapInstance) {
      updateMapMarkers(filteredRestaurants);
      
      // URL 파라미터로 특정 식당이 지정된 경우 해당 식당 정보 표시
      const restaurantId = searchParams.get('restaurantId');
      if (restaurantId) {
        const selectedRestaurant = filteredRestaurants.find(
          restaurant => restaurant.id.toString() === restaurantId
        );
        if (selectedRestaurant) {
          setTimeout(() => {
            setSelectedRestaurant(selectedRestaurant);
          }, 1000);
        }
      }
    }
  }, [filteredRestaurants, mapLoaded, mapInstance, searchParams]);

  // 카테고리 토글 함수
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 모든 카테고리 토글 함수
  const toggleAllCategories = () => {
    setSelectedCategories(selectedCategories.length === categories.length ? [] : categories);
  };

  // 검색어 초기화 함수
  const clearSearch = () => {
    setSearchQuery('');
  };

  // 카테고리 아이콘 반환 함수
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

  // 마커 상태 토글 함수
  const toggleMarkerStatus = (status) => {
    setSelectedMarkerStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // 모든 마커 상태 토글 함수
  const toggleAllMarkerStatus = () => {
    setSelectedMarkerStatus(selectedMarkerStatus.length === markerStatusOptions.length ? [] : markerStatusOptions.map(option => option.value));
  };

  useEffect(() => {
    // restaurantData에서 데이터를 가져와서 사용
    const restaurants = restaurantData;
    setRestaurants(restaurants);

    // URL 파라미터 확인
    const restaurantId = searchParams.get('restaurantId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // 사용자 위치 가져오기
    const getUserLocationForMap = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newUserLocation = { lat: latitude, lng: longitude };
            setUserLocation(newUserLocation);
            
            // 사용자 위치로 지도 초기화
            initKakaoMapWithLocation(latitude, longitude);
          },
          (error) => {
            console.log('위치 정보를 가져올 수 없습니다:', error);
            // 위치 정보를 가져올 수 없으면 기본 위치로 초기화
            initKakaoMapWithLocation();
          }
        );
      } else {
        // 위치 정보를 지원하지 않으면 기본 위치로 초기화
        initKakaoMapWithLocation();
      }
    };

    // 카카오맵 초기화 (위치 정보 포함)
    const initKakaoMapWithLocation = (userLat = null, userLng = null) => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById('map');
        
        // 우선순위: URL 파라미터 > 사용자 위치 > 기본 위치
        let centerLat, centerLng;
        if (lat && lng) {
          centerLat = parseFloat(lat);
          centerLng = parseFloat(lng);
        } else if (userLat && userLng) {
          centerLat = userLat;
          centerLng = userLng;
        } else {
          centerLat = 37.3520; // 정자동 중심
          centerLng = 127.1087;
        }
        
        const options = {
          center: new window.kakao.maps.LatLng(centerLat, centerLng),
          level: restaurantId ? 3 : 6
        };
        
        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);
        setMapLoaded(true);
        
        // 초기 마커 설정 (전체 레스토랑)
        updateMapMarkers(restaurants);

        // 사용자 위치 마커 추가
        if (userLat && userLng) {
          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(userLat, userLng),
            image: new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMlpNMTIgMjBDNy41OSAyMCA0IDE2LjQxIDQgMTJDNCA3LjU5IDcuNTkgNCAxMiA0QzE2LjQxIDQgMjAgNy41OSAyMCAxMkMyMCAxNi40MSAxNi40MSAyMCAxMiAyMFoiIGZpbGw9IiM2Njc5ZWEiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDNy41OSAyNiA0IDIyLjQxIDQgMThDNCAxMy41OSA3LjU5IDEwIDEyIDEwQzE2LjQxIDEwIDIwIDEzLjU5IDIwIDE4QzIwIDIyLjQxIDE2LjQxIDI2IDEyIDI2WiIgZmlsbD0iIzY2NzllYSIvPgo8L3N2Zz4K',
              new window.kakao.maps.Size(30, 30)
            )
          });
          
          userMarker.setMap(map);
          setUserMarker(userMarker);
        }
      } else {
        // 카카오맵 API가 로드되지 않았으면 1초 후 다시 시도
        setTimeout(() => initKakaoMapWithLocation(userLat, userLng), 1000);
      }
    };

    // 페이지 로드 후 사용자 위치 가져오기 및 지도 초기화
    const timer = setTimeout(getUserLocationForMap, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newUserLocation = { lat: latitude, lng: longitude };
        setUserLocation(newUserLocation);
        
        // 지도가 로드된 후에만 중심 이동
        if (mapInstance) {
          // 기존 사용자 마커 제거
          if (userMarker) {
            userMarker.setMap(null);
          }
          
          // 사용자 위치로 지도 중심 이동
          mapInstance.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
          mapInstance.setLevel(5);
          
          // 새로운 사용자 위치 마커 추가
          const newUserMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
            image: new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMlpNMTIgMjBDNy41OSAyMCA0IDE2LjQxIDQgMTJDNCA3LjU5IDcuNTkgNCAxMiA0QzE2LjQxIDQgMjAgNy41OSAyMCAxMkMyMCAxNi40MSAxNi40MSAyMCAxMiAyMFoiIGZpbGw9IiM2Njc5ZWEiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDNy41OSAyNiA0IDIyLjQxIDQgMThDNCAxMy41OSA3LjU5IDEwIDEyIDEwQzE2LjQxIDEwIDIwIDEzLjU5IDIwIDE4QzIwIDIyLjQxIDE2LjQxIDI2IDEyIDI2WiIgZmlsbD0iIzY2NzllYSIvPgo8L3N2Zz4K',
              new window.kakao.maps.Size(30, 30)
            )
          });
          
          newUserMarker.setMap(mapInstance);
          setUserMarker(newUserMarker);
        }
        
        // 가까운 식당 찾기 (3km 이내)
        const restaurantsWithDistance = restaurants.map(restaurant => {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            restaurant.position.lat, 
            restaurant.position.lng
          );
          return {
            ...restaurant,
            distance: distance
          };
        });

        const nearby = restaurantsWithDistance
          .filter(restaurant => restaurant.distance <= 3)
          .sort((a, b) => a.distance - b.distance);

        setNearbyRestaurants(nearby);
        setIsLoadingLocation(false);
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
        alert(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      '한식': '#ff6b6b',
      '양식': '#4ecdc4',
      '일식': '#45b7d1',
      '중식': '#96ceb4',
      '동남아식': '#feca57',
      '카페': '#ff9ff3'
    };
    return colors[category] || '#95a5a6';
  };

  // 현재 시간이 영업시간인지 확인하는 함수
  const isCurrentlyOpen = (businessHours) => {
    if (!businessHours) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // 간단한 시간 파싱 (예: "11:00 - 22:00")
    const timeMatch = businessHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) return true; // 파싱할 수 없으면 영업 중으로 간주
    
    const openHour = parseInt(timeMatch[1]);
    const openMinute = parseInt(timeMatch[2]);
    const closeHour = parseInt(timeMatch[3]);
    const closeMinute = parseInt(timeMatch[4]);
    
    const openTime = openHour * 100 + openMinute;
    const closeTime = closeHour * 100 + closeMinute;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  // 평점을 별로 표시하는 함수
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

  return (
    <div className="map-container">
      {/* 상단 검색 영역 */}
      <div className="map-header">
        <h2>🗺️ 인슐랭 맛집 지도</h2>
        
        {/* 검색창 */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="지역명, 맛집 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="clear-search-btn">
                ✕
              </button>
            )}
          </div>
          <div className="search-results">
            <span className="results-count">
              {filteredRestaurants.length}개의 맛집이 검색되었습니다
            </span>
          </div>
        </div>
      </div>

      <div className="map-content">
        {/* 왼쪽 필터 패널 */}
        <div className="filter-panel">
          <div className="filter-header">
            <h3>🍽️ 음식 종류 필터</h3>
            <button 
              onClick={toggleAllCategories}
              className="toggle-all-btn"
            >
              {selectedCategories.length === categories.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`category-filter-btn ${selectedCategories.includes(category) ? 'active' : ''}`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
          
          {/* 마커 상태 필터 */}
          <div className="marker-status-filters">
            <h4>🌟 맛집 상태 필터</h4>
            <button 
              onClick={toggleAllMarkerStatus}
              className="toggle-all-btn"
            >
              {selectedMarkerStatus.length === markerStatusOptions.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
          <div className="marker-status-options">
            {markerStatusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleMarkerStatus(option.value)}
                className={`marker-status-option ${selectedMarkerStatus.includes(option.value) ? 'active' : ''}`}
                data-status={option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* 선택된 맛집 정보 */}
          {selectedRestaurant && (
            <div className="selected-restaurant-info">
              <h4>📋 선택된 맛집</h4>
              <div className="restaurant-card">
                <h5>{selectedRestaurant.name}</h5>
                <p className="restaurant-category">{selectedRestaurant.category}</p>
                <div className="restaurant-rating">
                  <span className="stars">
                    {renderStars(selectedRestaurant.rating)}
                  </span>
                  <span className="rating-text">{selectedRestaurant.rating}</span>
                </div>
                <p className="restaurant-description">{selectedRestaurant.description}</p>
                <div className="restaurant-details">
                  <p>📍 {selectedRestaurant.address}</p>
                  <p>💰 {selectedRestaurant.price}</p>
                  <p>🕒 {selectedRestaurant.businessHours}</p>
                  <p>📞 {selectedRestaurant.phone}</p>
                  <p>🚗 {selectedRestaurant.parking}</p>
                </div>
                <div className="restaurant-actions">
                  <button 
                    className={`favorite-btn ${isInFavorites(selectedRestaurant.id) ? 'favorited' : ''}`}
                    onClick={() => {
                      if (isInFavorites(selectedRestaurant.id)) {
                        removeFromFavorites(selectedRestaurant.id);
                        alert('찜 목록에서 제거되었습니다! 👋');
                      } else {
                        addToFavorites(selectedRestaurant);
                        alert('찜 목록에 추가되었습니다! 🎉');
                      }
                    }}
                  >
                    {isInFavorites(selectedRestaurant.id) ? '❤️ 찜됨' : '🤍 찜하기'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 오른쪽 지도 */}
        <div className="map-section">
          <div id="map" style={{ width: '100%', height: '100%' }}></div>
          
          {/* 지도 위 위치 버튼 오버레이 */}
          <div className="map-location-overlay">
            <button 
              className={`location-btn ${isLoadingLocation ? 'loading' : ''}`}
              onClick={getUserLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? '📍 위치 확인 중...' : '📍 내 위치로 이동'}
            </button>
          </div>
          
          {/* 미니 팝업 */}
          {miniPopup && (
            <div 
              className="mini-popup"
              style={{
                left: `${popupPosition.x}px`,
                top: `${popupPosition.y}px`
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="mini-popup-header">
                <h4>{miniPopup.name}</h4>
                <button 
                  className="close-popup-btn"
                  onClick={() => setMiniPopup(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="mini-popup-content">
                <div className="mini-popup-rating">
                  <div className="stars">
                    {renderStars(miniPopup.rating)}
                  </div>
                  <span className="rating-text">{miniPopup.rating}</span>
                </div>
                
                <div className="mini-popup-info">
                  <p className="category">🍽️ {miniPopup.category}</p>
                  <p className={`business-status ${isCurrentlyOpen(miniPopup.businessHours) ? 'open' : 'closed'}`}>
                    {isCurrentlyOpen(miniPopup.businessHours) ? '🟢 영업 중' : '🔴 영업 종료'}
                  </p>
                </div>
                
                <div className="mini-popup-actions">
                  <button 
                    className={`favorite-btn ${isInFavorites(miniPopup.id) ? 'favorited' : ''}`}
                    onClick={() => {
                      if (isInFavorites(miniPopup.id)) {
                        removeFromFavorites(miniPopup.id);
                        alert('찜 목록에서 제거되었습니다! 👋');
                      } else {
                        addToFavorites(miniPopup);
                        alert('찜 목록에 추가되었습니다! 🎉');
                      }
                      setMiniPopup(null);
                    }}
                  >
                    {isInFavorites(miniPopup.id) ? '❤️ 찜됨' : '🤍 찜하기'}
                  </button>
                  <button 
                    className="detail-btn"
                    onClick={() => {
                      setDetailModal(miniPopup);
                      setMiniPopup(null);
                    }}
                  >
                    📋 상세보기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 상세정보 모달 */}
      {detailModal && (
        <RestaurantDetailModal
          restaurant={detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
}

export default KakaoMap; 