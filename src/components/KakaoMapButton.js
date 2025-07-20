import React, { useState } from 'react';
import { kakaoMapService } from '../services/kakaoMapService';
import './KakaoMapButton.css';

const KakaoMapButton = ({ restaurant }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mapData, setMapData] = useState(null);

  const handleSearchInKakaoMap = async () => {
    setIsLoading(true);
    setMapData(null);

    try {
      // 카카오맵에서 식당 위치 검색
      const result = await kakaoMapService.searchRestaurantLocation(
        restaurant.name,
        restaurant.address
      );

      if (result) {
        setMapData(result);
      } else {
        // 검색 실패 시 주소로만 좌표 검색
        const coordinates = await kakaoMapService.getCoordinatesFromAddress(restaurant.address);
        if (coordinates) {
          setMapData(coordinates);
        }
      }
    } catch (error) {
      console.error('카카오맵 검색 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openKakaoMap = () => {
    if (mapData) {
      const url = kakaoMapService.generateKakaoMapUrl(
        mapData.latitude,
        mapData.longitude,
        mapData.placeName || restaurant.name
      );
      window.open(url, '_blank');
    } else {
      // 검색 결과가 없으면 일반 검색으로 열기
      const searchUrl = kakaoMapService.generateKakaoSearchUrl(
        `${restaurant.name} ${restaurant.address}`
      );
      window.open(searchUrl, '_blank');
    }
  };

  const openKakaoSearch = () => {
    const searchUrl = kakaoMapService.generateKakaoSearchUrl(
      `${restaurant.name} ${restaurant.address}`
    );
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="kakao-map-button-container">
      {!mapData ? (
        <button
          className="kakao-map-search-btn"
          onClick={handleSearchInKakaoMap}
          disabled={isLoading}
        >
          {isLoading ? '검색 중...' : '카카오맵에서 검색'}
        </button>
      ) : (
        <div className="kakao-map-actions">
          <button
            className="kakao-map-open-btn"
            onClick={openKakaoMap}
          >
            지도에서 보기
          </button>
          <button
            className="kakao-map-search-btn"
            onClick={openKakaoSearch}
          >
            검색 결과 보기
          </button>
        </div>
      )}
      
      {mapData && (
        <div className="map-info">
          <p><strong>위치:</strong> {mapData.placeName || restaurant.name}</p>
          <p><strong>주소:</strong> {mapData.address}</p>
          {mapData.phone && <p><strong>전화:</strong> {mapData.phone}</p>}
        </div>
      )}
    </div>
  );
};

export default KakaoMapButton; 