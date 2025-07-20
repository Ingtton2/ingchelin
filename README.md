# 인슐랭 맛집 가이드 🍽️

React 프론트엔드와 Spring Boot 백엔드로 구성된 맛집 추천 웹 애플리케이션입니다.

## 🚀 기술 스택

### Frontend
- **React 19.1.0** - 사용자 인터페이스
- **React Router DOM** - 라우팅
- **Axios** - HTTP 클라이언트
- **Google Maps API** - 지도 서비스

<<<<<<< Updated upstream
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
=======
### Backend
- **Spring Boot 3.2.0** - REST API 서버
- **Spring Data JPA** - 데이터 접근 계층
- **H2 Database** - 인메모리 데이터베이스
- **Maven** - 빌드 도구
>>>>>>> Stashed changes

## 📁 프로젝트 구조

```
ingchelin/
├── src/                    # React 프론트엔드
│   ├── components/         # React 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── context/           # React Context
│   ├── services/          # API 서비스
│   └── data/              # 정적 데이터
├── backend/               # Spring Boot 백엔드
│   ├── src/main/java/     # Java 소스 코드
│   ├── src/main/resources/ # 설정 파일
│   └── pom.xml           # Maven 설정
└── public/               # 정적 파일
```

## 🛠️ 설치 및 실행

### 1. 프론트엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 2. 백엔드 실행

#### PostgreSQL 설정 (필수)

**Docker 사용 (권장):**
```bash
cd backend
docker-compose up -d postgres
```

**로컬 PostgreSQL 설치:**
```bash
# Homebrew로 PostgreSQL 설치
brew install postgresql@14

# PostgreSQL 서비스 시작
brew services start postgresql@14

# 데이터베이스 생성
createdb restaurantdb
```

#### Spring Boot 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# 자동 설정 스크립트 실행 (Maven, PostgreSQL 설정)
./setup.sh

# 또는 수동으로 실행
./mvnw spring-boot:run
```

백엔드는 `http://localhost:8080`에서 실행됩니다.

## 📚 API 엔드포인트

### 레스토랑 API

- `GET /api/restaurants` - 모든 레스토랑 조회
- `GET /api/restaurants/{id}` - ID로 레스토랑 조회
- `POST /api/restaurants` - 새 레스토랑 추가
- `PUT /api/restaurants/{id}` - 레스토랑 정보 수정
- `DELETE /api/restaurants/{id}` - 레스토랑 삭제
- `GET /api/restaurants/cuisine/{cuisine}` - 요리 타입으로 검색
- `GET /api/restaurants/rating/{rating}` - 평점으로 검색
- `GET /api/restaurants/search?keyword={keyword}` - 키워드로 검색
- `GET /api/restaurants/nearby?lat={lat}&lng={lng}&radius={radius}` - 근처 레스토랑 검색
- `GET /api/restaurants/random` - 랜덤 레스토랑 추천

## 🗄️ 데이터베이스

PostgreSQL 데이터베이스를 사용하며, 애플리케이션 시작 시 샘플 레스토랑 데이터가 자동으로 로드됩니다.

### PostgreSQL 설정

#### Docker 사용 (권장)
```bash
cd backend
docker-compose up -d postgres
```

#### 로컬 설치
```bash
# Homebrew로 PostgreSQL 설치
brew install postgresql@14

# PostgreSQL 서비스 시작
brew services start postgresql@14

# 데이터베이스 생성
createdb restaurantdb
```

### 데이터베이스 정보
- **URL**: `jdbc:postgresql://localhost:5432/restaurantdb`
- **Username**: `postgres`
- **Password**: `password`
- **Port**: `5432`

### pgAdmin (선택사항)
Docker Compose를 사용하면 pgAdmin도 함께 실행됩니다:
- **URL**: `http://localhost:8081`
- **Email**: `admin@restaurant.com`
- **Password**: `admin`

## ✨ 주요 기능

### 🏠 홈페이지
- 사용자 환영 메시지
- 위치 기반 추천
- TOP 3 맛집 소개
- 회원가입/로그인 링크

### 📋 맛집 목록
- 카테고리별 필터링
- 검색 기능
- 평점 시스템
- 찜하기 기능
- 상세 정보 모달

### 🗺️ 지도 서비스
- Google Maps 연동
- 레스토랑 위치 표시
- 클릭 시 상세 정보

### 🎲 랜덤 추천
- 필터 설정
- 랜덤 맛집 추천
- 찜하기/길찾기 기능

### ❤️ 찜 목록
- 찜한 맛집 관리
- 찜 해제 기능

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Java 17+
- Maven 3.6+

### 환경 변수
프론트엔드에서 백엔드 API URL을 변경하려면 `src/services/api.js` 파일을 수정하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
