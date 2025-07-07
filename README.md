# 🍽️ 레스토랑 추천 시스템

사용자 맞춤형 레스토랑 추천과 위치 기반 서비스를 제공하는 React 웹 애플리케이션입니다.

## ✨ 주요 기능

- **🔐 사용자 인증**: 회원가입/로그인 시스템
- **🎲 랜덤 추천**: 필터링 옵션과 함께 랜덤 레스토랑 추천
- **📍 위치 기반 추천**: 사용자 위치 기반 레스토랑 추천
- **🗺️ 지도 서비스**: Google Maps를 통한 레스토랑 위치 표시
- **❤️ 즐겨찾기**: 마음에 드는 레스토랑 저장 및 관리
- **📋 레스토랑 목록**: 카테고리별 필터링 및 상세 정보

## 🚀 시작하기

### 필수 요구사항
- Node.js (v14 이상)
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/Ingtton2/restaurant_web.git
cd restaurant_web
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm start
```

4. 브라우저에서 확인
```
http://localhost:3000
```

## 🔧 환경 설정

### Google Maps API 설정
지도 기능을 사용하려면 Google Maps API 키가 필요합니다:

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Maps JavaScript API 활성화
3. API 키 생성
4. `src/pages/Map.js` 파일의 `GOOGLE_MAPS_API_KEY` 변수에 API 키 입력

```javascript
const GOOGLE_MAPS_API_KEY = 'your-api-key-here';
```

## 📱 사용법

### 테스트 계정
- 이메일: `test@test.com`
- 비밀번호: `123456`

### 주요 페이지
- **🏠 홈**: 웹사이트 소개 및 주요 기능 안내
- **🍽️ 레스토랑 목록**: 카테고리별 레스토랑 필터링
- **🎲 랜덤 추천**: 필터 옵션과 함께 랜덤 추천
- **🗺️ 지도**: 레스토랑 위치 확인 및 상세 정보
- **❤️ 즐겨찾기**: 저장한 레스토랑 관리

### 레스토랑 데이터
- **총 30개 레스토랑**: 서울 지역 (20개) + 정자동 지역 (10개)
- **카테고리**: 한식, 양식, 일식, 중식, 동남아식, 카페
- **상세 정보**: 평점, 주소, 가격, 영업시간, 전화번호, 주차 정보

## 🛠️ 기술 스택

- **Frontend**: React 19.1.0
- **Routing**: React Router DOM 7.6.3
- **Maps**: Google Maps API
- **HTTP Client**: Axios
- **Styling**: CSS3 with Flexbox/Grid
- **State Management**: React Context API

## 📁 프로젝트 구조

```
restaurant_web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Navigation.js
│   │   ├── Navigation.css
│   │   ├── LocationBasedRecommendation.js
│   │   ├── RestaurantDetailModal.js
│   │   └── RestaurantDetailModal.css
│   ├── context/            # React Context (상태 관리)
│   │   ├── AuthContext.js
│   │   ├── FavoriteContext.js
│   │   └── VisitContext.js
│   ├── data/               # 정적 데이터
│   │   └── restaurantData.js
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── RestaurantList.js
│   │   ├── RestaurantList.css
│   │   ├── Map.js
│   │   ├── Map.css
│   │   ├── RandomRecommendation.js
│   │   ├── RandomRecommendation.css
│   │   ├── Favorites.js
│   │   └── Favorites.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## 🔐 인증 시스템

- **ProtectedRoute**: 인증이 필요한 페이지 보호
- **Context API**: 사용자 상태 관리
- **자동 리다이렉트**: 로그인하지 않은 사용자 자동 이동

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일과 데스크톱 최적화
- **모던 UI**: 그라데이션, 애니메이션, 블러 효과
- **사용자 친화적**: 직관적인 네비게이션과 인터페이스
- **접근성**: 키보드 네비게이션 지원

## 📊 데이터 구조

### 레스토랑 정보
```javascript
{
  id: number,
  name: string,
  category: string,
  rating: number,
  address: string,
  description: string,
  price: string,
  position: { lat: number, lng: number },
  hours: string,
  phone: string,
  parking: string
}
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 [이슈](https://github.com/Ingtton2/restaurant_web/issues)를 생성해주세요.

## 🚀 배포

### Netlify 배포
```bash
npm run build
```

빌드된 파일을 Netlify에 업로드하여 배포할 수 있습니다.

---

**개발자**: Ingtton2  
**GitHub**: [https://github.com/Ingtton2/restaurant_web](https://github.com/Ingtton2/restaurant_web)
