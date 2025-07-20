const API_BASE_URL = 'http://localhost:8081/api';

export const kakaoMapService = {
  // 식당 이름과 주소로 카카오맵에서 위치 검색
  async searchRestaurantLocation(restaurantName, address) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/kakao/search?restaurantName=${encodeURIComponent(restaurantName)}&address=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        throw new Error('식당 위치 검색에 실패했습니다.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('카카오맵 검색 오류:', error);
      return null;
    }
  },

  // 주소로 좌표 검색
  async getCoordinatesFromAddress(address) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/kakao/coordinates?address=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        throw new Error('주소 좌표 검색에 실패했습니다.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('주소 좌표 검색 오류:', error);
      return null;
    }
  },

  // 카카오맵 URL 생성
  generateKakaoMapUrl(latitude, longitude, placeName) {
    return `https://map.kakao.com/link/map/${placeName},${latitude},${longitude}`;
  },

  // 카카오맵 검색 URL 생성
  generateKakaoSearchUrl(query) {
    return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
  }
}; 