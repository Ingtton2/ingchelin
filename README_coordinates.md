# 🗺️ 레스토랑 좌표 변환 기능

이 프로젝트는 카카오 지도 API를 사용하여 레스토랑 주소를 실제 좌표로 변환하는 기능을 제공합니다.

## 📋 기능

- **주소 → 좌표 변환**: 카카오 지도 API를 사용한 정확한 좌표 변환
- **일괄 처리**: 여러 레스토랑의 좌표를 한 번에 변환
- **자동 업데이트**: 새로운 레스토랑 추가 시 자동으로 좌표 변환
- **임시 좌표 감지**: 기존 임시 좌표를 실제 좌표로 교체

## 🚀 설정 방법

### 1. 카카오 API 키 발급

1. [카카오 개발자 센터](https://developers.kakao.com/)에 접속
2. 애플리케이션 생성
3. REST API 키 발급
4. JavaScript 키 등록 (도메인 설정)

### 2. 환경변수 설정

```bash
# .env 파일 생성
cp env.example .env

# .env 파일 편집
REACT_APP_KAKAO_API_KEY=your_actual_kakao_api_key_here
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 3. 좌표 업데이트 실행

```bash
# 기존 레스토랑 데이터의 좌표를 실제 좌표로 업데이트
node scripts/updateCoordinates.js
```

## 📁 파일 구조

```
src/
├── utils/
│   └── geocoding.js          # 좌표 변환 유틸리티
├── data/
│   ├── restaurantData.js      # 기존 레스토랑 데이터
│   └── restaurantDataUpdated.js # 업데이트된 레스토랑 데이터
└── components/
    └── LocationBasedRecommendation.js # 주변 맛집 추천

scripts/
└── updateCoordinates.js       # 좌표 업데이트 스크립트
```

## 🔧 사용법

### 1. 단일 주소 변환

```javascript
import { geocodeAddress } from '../utils/geocoding.js';

const coordinates = await geocodeAddress('서울시 강남구 테헤란로 123');
console.log(coordinates); // { lat: 37.5665, lng: 126.9780 }
```

### 2. 여러 주소 일괄 변환

```javascript
import { batchGeocodeAddresses } from '../utils/geocoding.js';

const restaurants = [
  { id: 1, address: '서울시 강남구 테헤란로 123' },
  { id: 2, address: '서울시 서초구 서초대로 456' }
];

const coordinates = await batchGeocodeAddresses(restaurants);
```

### 3. 기존 데이터 업데이트

```javascript
import { updateRestaurantCoordinates } from '../utils/geocoding.js';
import { restaurantData } from '../data/restaurantData.js';

const updatedData = await updateRestaurantCoordinates(restaurantData);
```

### 4. 새로운 레스토랑 추가

```javascript
import { addRestaurantWithCoordinates } from '../utils/geocoding.js';

const newRestaurant = {
  name: '새로운 맛집',
  address: '서울시 강남구 압구정로 789',
  category: '한식'
};

const restaurantWithCoordinates = await addRestaurantWithCoordinates(newRestaurant);
```

## ⚠️ 주의사항

### API 호출 제한

- 카카오 지도 API는 **초당 10회** 호출 제한이 있습니다
- 일괄 처리 시 100ms 딜레이를 추가하여 제한을 준수합니다

### 에러 처리

- API 호출 실패 시 기본 좌표(서울 시청)를 사용합니다
- 네트워크 오류나 잘못된 주소에 대한 예외 처리가 포함되어 있습니다

### 환경변수

- API 키는 반드시 환경변수로 관리하세요
- `.env` 파일을 `.gitignore`에 추가하여 API 키가 노출되지 않도록 합니다

## 📊 성능 최적화

### 캐싱

```javascript
// 좌표 변환 결과를 로컬 스토리지에 캐싱
const cachedCoordinates = localStorage.getItem('coordinates');
if (cachedCoordinates) {
  return JSON.parse(cachedCoordinates);
}
```

### 배치 처리

- 여러 주소를 한 번에 처리하여 API 호출을 최소화
- 진행 상황을 콘솔에 출력하여 처리 상태를 확인

## 🔄 업데이트 프로세스

1. **기존 데이터 확인**: 임시 좌표 사용 여부 확인
2. **API 호출**: 카카오 지도 API로 실제 좌표 변환
3. **데이터 업데이트**: 변환된 좌표로 데이터 교체
4. **파일 저장**: 업데이트된 데이터를 새 파일로 저장
5. **통계 출력**: 업데이트된 레스토랑 수와 성공률 표시

## 📈 결과 예시

```
🚀 레스토랑 좌표 업데이트를 시작합니다...
📊 총 20개의 레스토랑 데이터를 처리합니다.
Converting coordinates for: 맛있는 한식당
Updated coordinates for 맛있는 한식당: { lat: 37.5665, lng: 126.9780 }
Converting coordinates for: 이탈리안 키친
Updated coordinates for 이탈리안 키친: { lat: 37.5013, lng: 127.0396 }
...
✅ 좌표 업데이트가 완료되었습니다!
📁 업데이트된 파일: src/data/restaurantDataUpdated.js
📈 업데이트된 레스토랑: 18/20개
```

## 🛠️ 문제 해결

### API 키 오류

```
Geocoding error: Error: Geocoding API request failed
```

**해결방법:**
1. API 키가 올바른지 확인
2. 도메인이 등록되어 있는지 확인
3. API 사용량 제한 확인

### 네트워크 오류

```
Geocoding error: TypeError: Failed to fetch
```

**해결방법:**
1. 인터넷 연결 확인
2. CORS 설정 확인
3. API 엔드포인트 URL 확인

### 잘못된 주소

```
Converting address for 레스토랑명: 잘못된 주소
```

**해결방법:**
1. 주소 형식 확인 (도로명 주소 권장)
2. 상세 주소 추가
3. 우편번호 포함

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
카카오 지도 API 사용 시 카카오의 이용약관을 준수해야 합니다. 