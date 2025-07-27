import React, { useState } from 'react';
import './KakaoMapButton.css';

const KakaoMapButton = ({ restaurant }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 카카오맵 URL 생성 함수들
  const generateKakaoMapUrl = (latitude, longitude, placeName) => {
    return `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${latitude},${longitude}`;
  };

  const generateKakaoSearchUrl = (query) => {
    return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
  };

  const openKakaoMap = () => {
    // 식당에 위치 정보가 있으면 지도에서 보기, 없으면 검색
    if (restaurant.position && restaurant.position.lat && restaurant.position.lng) {
      const url = generateKakaoMapUrl(
        restaurant.position.lat,
        restaurant.position.lng,
        restaurant.name
      );
      window.open(url, '_blank');
    } else if (restaurant.location && restaurant.location.lat && restaurant.location.lng) {
      const url = generateKakaoMapUrl(
        restaurant.location.lat,
        restaurant.location.lng,
        restaurant.name
      );
      window.open(url, '_blank');
    } else {
      // 위치 정보가 없으면 검색으로 열기
      openKakaoSearch();
    }
  };

  const openKakaoSearch = () => {
    const searchUrl = generateKakaoSearchUrl(
      `${restaurant.name} ${restaurant.address}`
    );
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="kakao-map-button-container">
      <div className="kakao-map-actions">
        <button
          className="kakao-map-open-btn"
          onClick={openKakaoMap}
        >
          카카오맵에서 보기
        </button>
        <button
          className="kakao-map-search-btn"
          onClick={openKakaoSearch}
        >
          검색 결과 보기
        </button>
      </div>
    </div>
  );
};

export default KakaoMapButton; 