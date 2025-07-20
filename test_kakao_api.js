const axios = require('axios');

const KAKAO_API_KEY = '59441d3fff7ca2883b02837c3fd4e391';

async function testKakaoAPI() {
    try {
        console.log('🔍 카카오맵 API 테스트 중...');
        
        const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: {
                query: '강남구 한식',
                category_group_code: 'FD6',
                size: 5
            },
            headers: {
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`
            }
        });
        
        console.log('✅ API 호출 성공!');
        console.log('📊 응답 데이터:', JSON.stringify(response.data, null, 2));
        
        if (response.data.documents && response.data.documents.length > 0) {
            console.log(`\n🍽️  찾은 식당 수: ${response.data.documents.length}개`);
            response.data.documents.forEach((place, index) => {
                console.log(`${index + 1}. ${place.place_name} - ${place.address_name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ API 호출 실패:', error.response?.data || error.message);
    }
}

testKakaoAPI(); 