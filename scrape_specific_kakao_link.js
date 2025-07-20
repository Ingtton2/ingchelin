const axios = require('axios');
const cheerio = require('cheerio');

const BACKEND_URL = 'http://localhost:8081';
const KAKAO_LINK = 'https://kko.kakao.com/wq_1sNZihU';

async function scrapeRestaurantsFromSpecificLink() {
    try {
        console.log('🔍 카카오맵 링크에서 식당 정보 스크래핑 중...');
        console.log(`📎 링크: ${KAKAO_LINK}`);
        
        // 카카오맵 페이지 가져오기
        const response = await axios.get(KAKAO_LINK, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
        
        const $ = cheerio.load(response.data);
        const restaurants = [];
        
        console.log('📄 페이지 내용 분석 중...');
        
        // 페이지에서 식당 정보 추출 시도
        // 다양한 선택자를 시도해보겠습니다
        const selectors = [
            '.place_item',
            '.item',
            '.restaurant',
            '.store',
            '.business',
            '[data-place]',
            '.search_result_item',
            '.result_item'
        ];
        
        let foundRestaurants = false;
        
        for (const selector of selectors) {
            const items = $(selector);
            if (items.length > 0) {
                console.log(`✅ 선택자 "${selector}"에서 ${items.length}개 항목 발견`);
                foundRestaurants = true;
                
                items.each((index, element) => {
                    const $item = $(element);
                    
                    // 다양한 텍스트 추출 방법 시도
                    const name = $item.find('.name, .title, .store_name, h3, h4, .link_name').first().text().trim() ||
                                $item.find('a').first().text().trim() ||
                                $item.text().substring(0, 50).trim();
                    
                    const address = $item.find('.address, .addr, .location, .place_address').text().trim() ||
                                   $item.find('[data-address]').attr('data-address') ||
                                   '';
                    
                    const phone = $item.find('.phone, .tel, .contact').text().trim() ||
                                 $item.find('[data-phone]').attr('data-phone') ||
                                 '';
                    
                    if (name && name.length > 0) {
                        restaurants.push({
                            name: name,
                            address: address || '주소 정보 없음',
                            phone: phone || '전화번호 정보 없음',
                            cuisine: '카테고리 정보 없음',
                            description: `${name} - ${address}`,
                            rating: 0,
                            latitude: 0,
                            longitude: 0
                        });
                    }
                });
                break;
            }
        }
        
        if (!foundRestaurants) {
            console.log('⚠️  일반적인 선택자로 식당 정보를 찾을 수 없습니다.');
            console.log('🔍 페이지 전체 텍스트에서 식당명 패턴을 찾아보겠습니다...');
            
            // 페이지 전체 텍스트에서 식당명 패턴 찾기
            const pageText = $('body').text();
            const lines = pageText.split('\n').filter(line => line.trim().length > 0);
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                // 식당명으로 보이는 패턴 찾기 (특수문자나 숫자가 적고, 길이가 적당한 텍스트)
                if (trimmedLine.length > 2 && trimmedLine.length < 50 && 
                    !trimmedLine.match(/^\d+$/) && 
                    !trimmedLine.includes('http') &&
                    !trimmedLine.includes('카카오') &&
                    !trimmedLine.includes('지도')) {
                    
                    restaurants.push({
                        name: trimmedLine,
                        address: '주소 정보 없음',
                        phone: '전화번호 정보 없음',
                        cuisine: '카테고리 정보 없음',
                        description: `${trimmedLine} - 스크래핑된 식당`,
                        rating: 0,
                        latitude: 0,
                        longitude: 0
                    });
                }
            }
        }
        
        console.log(`📊 발견된 식당 수: ${restaurants.length}개`);
        
        if (restaurants.length === 0) {
            console.log('❌ 식당 정보를 찾을 수 없습니다.');
            console.log('💡 카카오맵은 JavaScript로 동적 로딩을 하므로 직접 스크래핑이 어려울 수 있습니다.');
            return;
        }
        
        // 중복 제거
        const uniqueRestaurants = restaurants.filter((restaurant, index, self) =>
            index === self.findIndex(r => r.name === restaurant.name)
        );
        
        console.log(`📊 중복 제거 후 식당 수: ${uniqueRestaurants.length}개`);
        
        // 기존 데이터 삭제
        console.log('🗑️  기존 식당 데이터 삭제 중...');
        try {
            const existingResponse = await axios.get(`${BACKEND_URL}/api/restaurants`);
            const existingRestaurants = existingResponse.data;
            
            for (const restaurant of existingRestaurants) {
                try {
                    await axios.delete(`${BACKEND_URL}/api/restaurants/${restaurant.id}`);
                } catch (error) {
                    console.log(`⚠️  식당 삭제 실패 (ID: ${restaurant.id}): ${error.message}`);
                }
            }
            console.log(`✅ 기존 ${existingRestaurants.length}개 식당 삭제 완료`);
        } catch (error) {
            console.log(`⚠️  기존 데이터 삭제 실패: ${error.message}`);
        }
        
        // 새로운 데이터 저장
        console.log('💾 새로운 식당 데이터 저장 중...');
        let savedCount = 0;
        
        for (const restaurant of uniqueRestaurants) {
            try {
                const response = await axios.post(`${BACKEND_URL}/api/restaurants`, restaurant);
                savedCount++;
                console.log(`✅ 저장 완료: ${restaurant.name}`);
            } catch (error) {
                console.log(`❌ 저장 실패 (${restaurant.name}): ${error.message}`);
            }
        }
        
        console.log(`\n🎉 작업 완료!`);
        console.log(`📊 총 ${uniqueRestaurants.length}개 식당 중 ${savedCount}개 저장 성공`);
        
        if (savedCount > 0) {
            console.log(`\n📋 저장된 식당 목록:`);
            uniqueRestaurants.slice(0, 10).forEach((restaurant, index) => {
                console.log(`${index + 1}. ${restaurant.name} - ${restaurant.address}`);
            });
            if (uniqueRestaurants.length > 10) {
                console.log(`... 외 ${uniqueRestaurants.length - 10}개`);
            }
        }
        
    } catch (error) {
        console.error('❌ 스크래핑 중 오류 발생:', error.message);
        console.log('💡 카카오맵은 동적 콘텐츠를 사용하므로 직접 스크래핑이 어려울 수 있습니다.');
        console.log('🔧 대안: 카카오맵 API를 사용하여 유사한 지역의 식당을 검색할 수 있습니다.');
    }
}

// 스크립트 실행
scrapeRestaurantsFromSpecificLink(); 