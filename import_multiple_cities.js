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
                console.log(`❌ 삭제 실패: ${restaurant.name}`);
            }
        }
        
        console.log('✅ 기존 데이터 삭제 완료');
        
    } catch (error) {
        console.error('❌ 기존 데이터 삭제 실패:', error.message);
    }
}

async function importRestaurantsByCity(city, category) {
    try {
        console.log(`🍽️  ${city} ${category} 카테고리 식당 정보 가져오는 중...`);
        
        const response = await axios.post(`${BACKEND_URL}/api/kakao/import-restaurants`, {
            query: `${city} ${category}`,
            category: category
        });
        
        console.log(`✅ ${city} ${category}: ${response.data.savedCount}개 저장됨`);
        return response.data;
        
    } catch (error) {
        console.error(`❌ ${city} ${category} 오류:`, error.response?.data || error.message);
        return null;
    }
}

async function importMultipleCities() {
    console.log('🚀 여러 도시의 식당 정보 가져오기 시작...');
    
    // 기존 데이터 삭제
    await clearAllRestaurants();
    
    let totalSaved = 0;
    const results = {};
    
    for (const city of cities) {
        console.log(`\n🏙️  ${city} 처리 중...`);
        results[city] = {};
        
        for (const category of categories) {
            const result = await importRestaurantsByCity(city, category);
            if (result) {
                results[city][category] = result.savedCount;
                totalSaved += result.savedCount;
            } else {
                results[city][category] = 0;
            }
            
            // API 호출 간격 조절
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log('\n📊 최종 결과:');
    console.log('=' * 50);
    
    for (const city of cities) {
        console.log(`\n🏙️  ${city}:`);
        let cityTotal = 0;
        for (const category of categories) {
            const count = results[city][category];
            console.log(`  - ${category}: ${count}개`);
            cityTotal += count;
        }
        console.log(`  📈 총 ${cityTotal}개`);
    }
    
    console.log(`\n🎉 전체 ${totalSaved}개의 식당 정보가 저장되었습니다!`);
}

// 스크립트 실행
importMultipleCities().catch(console.error); 