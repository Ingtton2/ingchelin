const axios = require('axios');

const KAKAO_API_KEY = '018e12cfad2a0755c9aaf27e43bf9619';

async function testNewKakaoAPI() {
    try {
        console.log('🔍 새로운 카카오맵 API 키로 테스트 중...');
        
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
                console.log(`\n${index + 1}. ${place.place_name}`);
                console.log(`   주소: ${place.address_name}`);
                console.log(`   전화: ${place.phone || '없음'}`);
                console.log(`   URL: ${place.place_url}`);
            });
        } else {
            console.log('❌ 식당을 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ API 호출 실패:', error.response?.data || error.message);
    }
}

testNewKakaoAPI(); 