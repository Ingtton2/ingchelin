const axios = require('axios');

const BACKEND_URL = 'http://localhost:8081';
const KAKAO_API_KEY = '018e12cfad2a0755c9aaf27e43bf9619';

const categories = [
    '한식', '중식', '일식', '양식', '카페', '술집', '분식', '치킨', '피자', '햄버거'
];

async function importRestaurantsByCategory(location, category) {
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

async function importMultipleCategories(location) {
    console.log(`\n🚀 ${location} 지역의 여러 카테고리 식당 정보를 가져오는 중...\n`);
    
    const results = {};
    
    for (const category of categories) {
        const result = await importRestaurantsByCategory(location, category);
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
}

// 실행
const location = '강남구';
importMultipleCategories(location); 