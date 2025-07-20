const puppeteer = require('puppeteer');
const axios = require('axios');

const BACKEND_URL = 'http://localhost:8081';
const KAKAO_LINK = 'https://kko.kakao.com/wq_1sNZihU';

async function scrapeWithPuppeteer() {
    let browser;
    try {
        console.log('🔍 Puppeteer로 카카오맵 링크에서 식당 정보 스크래핑 중...');
        console.log(`📎 링크: ${KAKAO_LINK}`);
        
        // 브라우저 시작
        browser = await puppeteer.launch({
            headless: false, // 브라우저 창을 보면서 디버깅
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // 사용자 에이전트 설정
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('🌐 페이지 로딩 중...');
        await page.goto(KAKAO_LINK, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // 페이지가 완전히 로드될 때까지 대기 (waitForTimeout 대신 delay 사용)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('🔍 페이지 내용 분석 중...');
        
        // 다양한 방법으로 식당 정보 추출 시도
        const restaurants = await page.evaluate(() => {
            const results = [];
            
            // 방법 1: 일반적인 식당 리스트 선택자들
            const selectors = [
                '.place_item',
                '.item',
                '.restaurant',
                '.store',
                '.business',
                '[data-place]',
                '.search_result_item',
                '.result_item',
                '.list_item',
                '.place_list_item'
            ];
            
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`Found ${elements.length} items with selector: ${selector}`);
                    elements.forEach((element, index) => {
                        const name = element.querySelector('.name, .title, .store_name, h3, h4, .link_name')?.textContent?.trim() ||
                                   element.querySelector('a')?.textContent?.trim() ||
                                   element.textContent?.substring(0, 50)?.trim();
                        
                        const address = element.querySelector('.address, .addr, .location, .place_address')?.textContent?.trim() ||
                                      element.querySelector('[data-address]')?.getAttribute('data-address') ||
                                      '';
                        
                        if (name && name.length > 0) {
                            results.push({
                                name: name,
                                address: address || '주소 정보 없음',
                                phone: '전화번호 정보 없음',
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
            
            // 방법 2: 페이지 전체에서 식당명 패턴 찾기
            if (results.length === 0) {
                const pageText = document.body.textContent;
                const lines = pageText.split('\n').filter(line => line.trim().length > 0);
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    // 식당명으로 보이는 패턴 찾기
                    if (trimmedLine.length > 2 && trimmedLine.length < 50 && 
                        !trimmedLine.match(/^\d+$/) && 
                        !trimmedLine.includes('http') &&
                        !trimmedLine.includes('카카오') &&
                        !trimmedLine.includes('지도') &&
                        !trimmedLine.includes('메뉴') &&
                        !trimmedLine.includes('설정') &&
                        !trimmedLine.includes('로그인') &&
                        !trimmedLine.includes('검색')) {
                        
                        results.push({
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
            
            return results;
        });
        
        console.log(`📊 발견된 식당 수: ${restaurants.length}개`);
        
        if (restaurants.length === 0) {
            console.log('❌ 식당 정보를 찾을 수 없습니다.');
            console.log('💡 카카오맵은 복잡한 동적 로딩을 사용하므로 직접 스크래핑이 어려울 수 있습니다.');
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
        console.log('💡 카카오맵은 복잡한 보안 조치를 사용하므로 직접 스크래핑이 어려울 수 있습니다.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 스크립트 실행
scrapeWithPuppeteer(); 