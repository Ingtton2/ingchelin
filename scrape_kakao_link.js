const axios = require('axios');
const cheerio = require('cheerio');

const BACKEND_URL = 'http://localhost:8081';
const KAKAO_LINK = 'https://kko.kakao.com/F8RVyWwLSN';

async function scrapeRestaurantsFromKakaoLink() {
    try {
        console.log('🔍 카카오맵 링크에서 식당 정보 스크래핑 중...');
        
        // 카카오맵 페이지 가져오기
        const response = await axios.get(KAKAO_LINK, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const restaurants = [];
        
        // 페이지에서 식당 정보 추출
        $('.place_item').each((index, element) => {
            const name = $(element).find('.link_name').text().trim();
            const address = $(element).find('.addr').text().trim();
            const phone = $(element).find('.tel').text().trim();
            const category = $(element).find('.category').text().trim();
            
            if (name) {
                restaurants.push({
                    name: name,
                    address: address || '주소 정보 없음',
                    phone: phone || '전화번호 정보 없음',
                    cuisine: category || '기타',
                    description: `${category} - ${address}`,
                    rating: Math.floor(Math.random() * 2) + 4, // 4-5점 랜덤
                    latitude: 37.5665, // 서울 기본 좌표
                    longitude: 126.9780,
                    url: KAKAO_LINK
                });
            }
        });
        
        // 다른 선택자들도 시도
        $('[data-testid="place-item"]').each((index, element) => {
            const name = $(element).find('[data-testid="place-name"]').text().trim();
            const address = $(element).find('[data-testid="place-address"]').text().trim();
            
            if (name && !restaurants.find(r => r.name === name)) {
                restaurants.push({
                    name: name,
                    address: address || '주소 정보 없음',
                    phone: '전화번호 정보 없음',
                    cuisine: '기타',
                    description: address,
                    rating: Math.floor(Math.random() * 2) + 4,
                    latitude: 37.5665,
                    longitude: 126.9780,
                    url: KAKAO_LINK
                });
            }
        });
        
        console.log(`📊 스크래핑된 식당 수: ${restaurants.length}개`);
        
        if (restaurants.length === 0) {
            console.log('⚠️  스크래핑된 식당이 없습니다. 페이지 구조를 확인해보겠습니다...');
            console.log('페이지 내용 일부:', response.data.substring(0, 1000));
        }
        
        return restaurants;
        
    } catch (error) {
        console.error('❌ 스크래핑 오류:', error.message);
        return [];
    }
}

async function clearAllRestaurants() {
    try {
        console.log('🗑️  기존 식당 데이터 삭제 중...');
        
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

async function saveRestaurants(restaurants) {
    try {
        console.log('💾 식당 정보 저장 중...');
        
        let savedCount = 0;
        
        for (const restaurant of restaurants) {
            try {
                await axios.post(`${BACKEND_URL}/api/restaurants`, restaurant);
                console.log(`✅ 저장됨: ${restaurant.name}`);
                savedCount++;
            } catch (error) {
                console.log(`❌ 저장 실패: ${restaurant.name} - ${error.response?.data || error.message}`);
            }
            
            // API 호출 간격 조절
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`🎉 총 ${savedCount}개의 식당이 저장되었습니다!`);
        return savedCount;
        
    } catch (error) {
        console.error('❌ 저장 오류:', error.message);
        return 0;
    }
}

async function main() {
    console.log('🚀 카카오맵 링크에서 식당 정보 가져오기 시작...');
    
    // 기존 데이터 삭제
    await clearAllRestaurants();
    
    // 카카오맵 링크에서 식당 정보 스크래핑
    const restaurants = await scrapeRestaurantsFromKakaoLink();
    
    if (restaurants.length > 0) {
        // 데이터베이스에 저장
        await saveRestaurants(restaurants);
    } else {
        console.log('❌ 스크래핑할 식당 정보가 없습니다.');
    }
}

// 스크립트 실행
main().catch(console.error); 