const axios = require('axios');

const BACKEND_URL = 'http://localhost:8081';
const KAKAO_API_KEY = '018e12cfad2a0755c9aaf27e43bf9619';

// 도시별 검색 설정
const cities = [
    '서울특별시',
    '성남시', 
    '강릉시',
    '부산광역시',
    '제주특별자치도',
    '여수시',
    '속초시'
];

const categories = [
    '한식', '중식', '일식', '양식', '카페', '분식', '치킨', '피자', '햄버거'
];

async function clearAllRestaurants() {
    try {
        console.log('🗑️  기존 식당 데이터 삭제 중...');
        
        // 모든 식당 목록을 가져와서 개별 삭제
        const response = await axios.get(`${BACKEND_URL}/api/restaurants`);
        const restaurants = response.data;
        
        console.log(`📊 삭제할 식당 수: ${restaurants.length}개`);
        
        for (const restaurant of restaurants) {
            try {
                await axios.delete(`${BACKEND_URL}/api/restaurants/${restaurant.id}`);
                console.log(`✅ 삭제됨: ${restaurant.name}`);
            } catch (error) {
                console.log(`❌ 삭제 실패: ${restaurant.name} - ${error.message}`);
            }
        }
        
        console.log('✅ 기존 데이터 삭제 완료');
    } catch (error) {
        console.error('❌ 데이터 삭제 중 오류:', error.message);
    }
}

async function importRestaurantsFromKakaoAPI() {
    try {
        console.log('🚀 새로운 API 키로 식당 데이터 가져오기 시작...');
        
        let totalImported = 0;
        
        for (const city of cities) {
            console.log(`\n📍 ${city} 처리 중...`);
            let cityImported = 0;
            
            for (const category of categories) {
                try {
                    console.log(`  🍽️  ${category} 카테고리 처리 중...`);
                    
                    // 카카오맵 API 호출
                    const searchQuery = `${city} ${category}`;
                    const kakaoResponse = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
                        params: {
                            query: searchQuery,
                            size: 15
                        },
                        headers: {
                            'Authorization': `KakaoAK ${KAKAO_API_KEY}`
                        }
                    });
                    
                    const places = kakaoResponse.data.documents;
                    console.log(`    📍 ${places.length}개 장소 발견`);
                    
                    // 각 장소를 데이터베이스에 저장
                    for (const place of places) {
                        try {
                            const restaurantData = {
                                name: place.place_name,
                                cuisine: category,
                                address: place.road_address_name || place.address_name,
                                phone: place.phone,
                                latitude: parseFloat(place.y),
                                longitude: parseFloat(place.x),
                                description: `${city}의 ${category} 맛집`,
                                rating: Math.floor(Math.random() * 3) + 3 // 3-5점 랜덤
                            };
                            
                            await axios.post(`${BACKEND_URL}/api/restaurants`, restaurantData);
                            console.log(`    ✅ 저장됨: ${place.place_name}`);
                            cityImported++;
                            totalImported++;
                            
                        } catch (error) {
                            console.log(`    ❌ 저장 실패: ${place.place_name} - ${error.message}`);
                        }
                    }
                    
                    // API 호출 간격 조절
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.log(`  ❌ ${category} 카테고리 처리 실패: ${error.message}`);
                }
            }
            
            console.log(`✅ ${city}: ${cityImported}개 식당 저장 완료`);
        }
        
        console.log(`\n🎉 완료! 총 ${totalImported}개의 식당이 데이터베이스에 저장되었습니다.`);
        
    } catch (error) {
        console.error('❌ 데이터 가져오기 중 오류:', error.message);
    }
}

async function main() {
    try {
        // 1. 기존 데이터 삭제
        await clearAllRestaurants();
        
        // 2. 새로운 데이터 가져오기
        await importRestaurantsFromKakaoAPI();
        
    } catch (error) {
        console.error('❌ 메인 실행 중 오류:', error.message);
    }
}

main(); 