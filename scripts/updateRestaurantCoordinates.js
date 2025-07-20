// 레스토랑 데이터베이스의 address를 사용해서 좌표를 업데이트하는 스크립트

const axios = require('axios');
const { Pool } = require('pg');

// PostgreSQL 데이터베이스 연결 설정
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'ingtto',
  password: '',
  database: 'restaurantdb'
};

// 카카오 지도 API 키
const KAKAO_API_KEY = '018e12cfad2a0755c9aaf27e43bf9619';

/**
 * 주소를 좌표로 변환하는 함수
 * @param {string} address - 변환할 주소
 * @returns {Promise<{lat: number, lng: number} | null>} 좌표 객체 또는 null
 */
async function geocodeAddress(address) {
  try {
    console.log(`🔍 주소 변환 중: ${address}`);
    
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_API_KEY}`
        }
      }
    );

    if (response.data.documents && response.data.documents.length > 0) {
      const result = response.data.documents[0];
      const coordinates = {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x)
      };
      
      console.log(`✅ 좌표 변환 성공: ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;
    } else {
      console.log(`❌ 주소를 찾을 수 없음: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 지오코딩 에러 (${address}):`, error.message);
    return null;
  }
}

/**
 * 레스토랑 좌표 업데이트 함수
 */
async function updateRestaurantCoordinates() {
  let pool;
  
  try {
    // 데이터베이스 연결
    pool = new Pool(dbConfig);
    console.log('✅ 데이터베이스 연결 성공');

    // address가 있지만 latitude, longitude가 없는 레스토랑 조회
    const result = await pool.query(`
      SELECT id, name, address 
      FROM restaurants 
      WHERE address IS NOT NULL 
      AND address != '' 
      AND (latitude IS NULL OR longitude IS NULL)
    `);

    const restaurants = result.rows;
    console.log(`📊 총 ${restaurants.length}개의 레스토랑을 처리합니다.`);

    if (restaurants.length === 0) {
      console.log('✅ 업데이트할 레스토랑이 없습니다.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // 각 레스토랑의 좌표 업데이트
    for (const restaurant of restaurants) {
      console.log(`\n🔄 처리 중: ${restaurant.name} (${restaurant.address})`);
      
      const coordinates = await geocodeAddress(restaurant.address);
      
      if (coordinates) {
        // 데이터베이스 업데이트
        await pool.query(`
          UPDATE restaurants 
          SET latitude = $1, longitude = $2 
          WHERE id = $3
        `, [coordinates.lat, coordinates.lng, restaurant.id]);
        
        console.log(`✅ 업데이트 완료: ${restaurant.name}`);
        successCount++;
      } else {
        console.log(`❌ 업데이트 실패: ${restaurant.name}`);
        failCount++;
      }

      // API 호출 제한을 위한 딜레이 (초당 2회 제한)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 업데이트 완료:`);
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failCount}개`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 데이터베이스 연결 종료');
    }
  }
}

/**
 * 현재 레스토랑 좌표 상태 확인
 */
async function checkRestaurantCoordinates() {
  let pool;
  
  try {
    pool = new Pool(dbConfig);
    
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM restaurants');
    const withCoordinatesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM restaurants 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    const withoutCoordinatesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM restaurants 
      WHERE latitude IS NULL OR longitude IS NULL
    `);
    const withAddressResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM restaurants 
      WHERE address IS NOT NULL AND address != ''
    `);

    console.log('📊 레스토랑 좌표 현황:');
    console.log(`📈 전체 레스토랑: ${totalResult.rows[0].count}개`);
    console.log(`✅ 좌표 있음: ${withCoordinatesResult.rows[0].count}개`);
    console.log(`❌ 좌표 없음: ${withoutCoordinatesResult.rows[0].count}개`);
    console.log(`📍 주소 있음: ${withAddressResult.rows[0].count}개`);

  } catch (error) {
    console.error('❌ 상태 확인 에러:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// 메인 실행
async function main() {
  const command = process.argv[2];
  
  if (command === 'check') {
    await checkRestaurantCoordinates();
  } else {
    console.log('🚀 레스토랑 좌표 업데이트를 시작합니다...');
    await updateRestaurantCoordinates();
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  updateRestaurantCoordinates,
  checkRestaurantCoordinates,
  geocodeAddress
}; 