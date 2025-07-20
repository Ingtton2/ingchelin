// 카카오 지도 API를 사용한 지오코딩 유틸리티

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY || '018e12cfad2a0755c9aaf27e43bf9619';

/**
 * 주소를 좌표로 변환하는 함수
 * @param {string} address - 변환할 주소
 * @returns {Promise<{lat: number, lng: number}>} 좌표 객체
 */
export const geocodeAddress = async (address) => {
  try {
    console.log(`🔍 주소 변환 중: ${address}`);
    
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`카카오 API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0];
      const coordinates = {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x)
      };
      
      console.log(`✅ 좌표 변환 성공: ${address} → ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;
    } else {
      console.warn(`⚠️ 주소를 찾을 수 없음: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 지오코딩 오류 (${address}):`, error);
    return null;
  }
};

/**
 * 여러 레스토랑의 좌표를 일괄 업데이트하는 함수
 * @param {Array} restaurants - 레스토랑 배열
 * @returns {Promise<Array>} 업데이트된 레스토랑 배열
 */
export const updateRestaurantCoordinates = async (restaurants) => {
  const updatedRestaurants = [];
  
  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    
    // 이미 정확한 좌표가 있는지 확인
    const hasAccurateCoordinates = restaurant.position && 
      restaurant.position.lat !== 37.5665 && 
      restaurant.position.lng !== 126.9780;
    
    if (!hasAccurateCoordinates && restaurant.address) {
      console.log(`📍 ${i + 1}/${restaurants.length} - ${restaurant.name} 처리 중...`);
      
      const coordinates = await geocodeAddress(restaurant.address);
      
      if (coordinates) {
        updatedRestaurants.push({
          ...restaurant,
          position: coordinates
        });
      } else {
        // 좌표 변환 실패 시 기존 데이터 유지
        updatedRestaurants.push(restaurant);
      }
      
      // API 호출 제한을 위한 딜레이 (초당 10회 제한)
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      updatedRestaurants.push(restaurant);
    }
  }
  
  return updatedRestaurants;
};

/**
 * 좌표 변환 결과를 파일로 저장하는 함수
 * @param {Array} restaurants - 레스토랑 배열
 * @param {string} filename - 저장할 파일명
 */
export const saveCoordinatesToFile = (restaurants, filename = 'restaurantDataUpdated.js') => {
  const fs = require('fs');
  const path = require('path');
  
  const fileContent = `// 실제 좌표가 적용된 레스토랑 데이터
// 생성일: ${new Date().toISOString()}
// 카카오 지도 API를 사용하여 주소를 좌표로 변환

export const restaurantData = ${JSON.stringify(restaurants, null, 2)};
`;

  const outputPath = path.join(process.cwd(), 'src/data', filename);
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  
  console.log(`💾 좌표 데이터 저장 완료: ${outputPath}`);
  return outputPath;
}; 