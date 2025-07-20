// 레스토랑 데이터의 좌표를 실제 좌표로 업데이트하는 스크립트

const fs = require('fs');
const path = require('path');

// 카카오 지도 API를 사용한 지오코딩 함수
const geocodeAddress = async (address) => {
  const KAKAO_API_KEY = '018e12cfad2a0755c9aaf27e43bf9619';
  
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
 * 레스토랑 데이터의 좌표를 실제 좌표로 업데이트하고 파일에 저장
 */
async function updateRestaurantCoordinatesScript() {
  try {
    console.log('🚀 레스토랑 좌표 업데이트를 시작합니다...');
    
    // 레스토랑 데이터 읽기
    const restaurantDataPath = path.join(process.cwd(), 'src/data/restaurantData.js');
    const restaurantDataContent = fs.readFileSync(restaurantDataPath, 'utf8');
    
    // 간단한 파싱 (실제로는 더 정교한 파싱이 필요)
    const dataMatch = restaurantDataContent.match(/export const restaurantData = (\[[\s\S]*\]);/);
    if (!dataMatch) {
      throw new Error('레스토랑 데이터를 파싱할 수 없습니다.');
    }
    
    const restaurantData = eval(dataMatch[1]);
    console.log(`📊 총 ${restaurantData.length}개의 레스토랑 데이터를 처리합니다.`);
    
    // 실제 좌표로 업데이트
    const updatedRestaurants = [];
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < restaurantData.length; i++) {
      const restaurant = restaurantData[i];
      
      // 임시 좌표인지 확인
      const isTemporaryCoordinate = 
        (restaurant.position.lat === 37.5665 && restaurant.position.lng === 126.9780) ||
        (restaurant.position.lat === 37.5013 && restaurant.position.lng === 127.0396) ||
        (restaurant.position.lat === 37.5519 && restaurant.position.lng === 126.9251) ||
        (restaurant.position.lat === 37.5735 && restaurant.position.lng === 126.9789) ||
        (restaurant.position.lat === 37.5344 && restaurant.position.lng === 126.9942) ||
        (restaurant.position.lat === 37.5270 && restaurant.position.lng === 127.0276);
      
      if (isTemporaryCoordinate && restaurant.address) {
        console.log(`📍 ${i + 1}/${restaurantData.length} - ${restaurant.name} 처리 중...`);
        const newPosition = await geocodeAddress(restaurant.address);
        
        if (newPosition) {
          updatedRestaurants.push({
            ...restaurant,
            position: newPosition
          });
          successCount++;
        } else {
          updatedRestaurants.push(restaurant);
          failCount++;
        }
      } else {
        updatedRestaurants.push(restaurant);
      }
      
      // API 호출 제한을 위한 딜레이 (초당 10회 제한)
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 업데이트된 데이터를 파일로 저장
    const outputPath = path.join(process.cwd(), 'src/data/restaurantDataUpdated.js');
    
    const fileContent = `// 실제 좌표가 적용된 레스토랑 데이터
// 생성일: ${new Date().toISOString()}
// 카카오 지도 API를 사용하여 주소를 좌표로 변환

export const restaurantData = ${JSON.stringify(updatedRestaurants, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent, 'utf8');
    
    console.log('✅ 좌표 업데이트가 완료되었습니다!');
    console.log(`📁 업데이트된 파일: ${outputPath}`);
    console.log(`📈 성공: ${successCount}개, 실패: ${failCount}개`);
    
  } catch (error) {
    console.error('❌ 좌표 업데이트 중 오류가 발생했습니다:', error);
  }
}

// 스크립트 실행
updateRestaurantCoordinatesScript(); 