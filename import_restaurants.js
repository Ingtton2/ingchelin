const axios = require('axios');

// 카테고리별 식당 정보 가져오기
const categories = [
    "한식",
    "중식", 
    "일식",
    "양식",
    "카페",
    "술집",
    "분식",
    "치킨",
    "피자",
    "햄버거"
];

const location = "강남구"; // 원하는 지역으로 변경

async function importRestaurants() {
    console.log(`📍 ${location} 지역의 식당 정보를 가져오는 중...`);
    
    for (const category of categories) {
        try {
            console.log(`\n🍽️  ${category} 카테고리 처리 중...`);
            
            const response = await axios.post('http://localhost:8081/api/kakao/import-restaurants', {
                query: `${location} ${category}`,
                category: category
            });
            
            console.log(`✅ ${category}: ${response.data.savedCount}개 저장됨`);
            
            // API 호출 간격을 두어 서버 부하 방지
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ ${category} 처리 실패:`, error.response?.data || error.message);
        }
    }
    
    console.log('\n🎉 모든 카테고리 처리 완료!');
}

// 스크립트 실행
importRestaurants().catch(console.error); 