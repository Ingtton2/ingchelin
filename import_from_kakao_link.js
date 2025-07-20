const axios = require('axios');

const BACKEND_URL = 'http://localhost:8081';
const KAKAO_API_KEY = '018e12cfad2a0755c9aaf27e43bf9619';

// 카카오맵 링크에서 추출한 지역 정보 (강남구)
const location = '강남구';

// 카테고리별 검색 쿼리
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
        
        console.log('✅ 모든 기존 식당 데이터 삭제 완료');
        
    } catch (error) {
        console.error('❌ 식당 데이터 삭제 실패:', error.message);
    }
}

async function importRestaurantsByCategory(category) {
    try {
        console.log(`🍽️  ${category} 카테고리 식당 정보 가져오는 중...`);
        
        const response = await axios.post(`${BACKEND_URL}/api/kakao/import-restaurants`, {
            query: `${location} ${category}`,
            category: category
        });
        
        console.log(`✅ ${category}: ${response.data.savedCount}개 저장됨`);
        return response.data;
        
    } catch (error) {
        console.error(`❌ ${category} 오류:`, error.response?.data || error.message);
        return null;
    }
}

async function importFromKakaoLink() {
    console.log(`\n🚀 카카오맵 링크에서 식당 정보를 가져오는 중...\n`);
    
    // 1. 기존 데이터 삭제
    await clearAllRestaurants();
    
    // 2. 새로운 데이터 가져오기
    const results = {};
    
    for (const category of categories) {
        const result = await importRestaurantsByCategory(category);
        if (result) {
            results[category] = result.savedCount;
        }
        
        // API 호출 간격을 두어 서버 부하 방지
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 최종 결과:');
    console.log('================');
    let totalSaved = 0;
    for (const [category, count] of Object.entries(results)) {
        console.log(`${category}: ${count}개`);
        totalSaved += count;
    }
    console.log(`================`);
    console.log(`총 저장된 식당: ${totalSaved}개`);
    console.log('\n🎉 카카오맵 링크에서 식당 정보 가져오기 완료!');
}

// 실행
importFromKakaoLink(); 