# Restaurant Backend API

Spring Boot로 구현된 레스토랑 추천 시스템의 백엔드 API입니다.

## 🚀 기술 스택

- **Spring Boot 3.2.0** - 웹 프레임워크
- **Spring Data JPA** - 데이터 접근 계층
- **H2 Database** - 인메모리 데이터베이스
- **Maven** - 빌드 도구
- **Java 17** - 프로그래밍 언어

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/restaurant/backend/
│   │   │   ├── controller/     # REST API 컨트롤러
│   │   │   ├── entity/         # JPA 엔티티
│   │   │   ├── repository/     # 데이터 접근 계층
│   │   │   └── config/         # 설정 클래스
│   │   └── resources/
│   │       └── application.properties  # 애플리케이션 설정
│   └── test/                   # 테스트 코드
├── pom.xml                     # Maven 설정
└── README.md                   # 프로젝트 문서
```

## 🛠️ 실행 방법

### 1. Java 17 설치 확인

```bash
java -version
```

### 2. Maven Wrapper 사용하여 실행

```bash
# 개발 서버 실행
./mvnw spring-boot:run
```

### 3. JAR 파일로 실행

```bash
# 빌드
./mvnw clean package

# 실행
java -jar target/restaurant-backend-0.0.1-SNAPSHOT.jar
```

## 📚 API 문서

### 기본 URL
```
http://localhost:8080/api
```

### 레스토랑 API

#### 모든 레스토랑 조회
```
GET /api/restaurants
```

#### ID로 레스토랑 조회
```
GET /api/restaurants/{id}
```

#### 새 레스토랑 추가
```
POST /api/restaurants
Content-Type: application/json

{
  "name": "레스토랑명",
  "address": "주소",
  "phone": "전화번호",
  "cuisine": "요리타입",
  "rating": 4.5,
  "description": "설명",
  "latitude": 37.5665,
  "longitude": 127.0080
}
```

#### 레스토랑 정보 수정
```
PUT /api/restaurants/{id}
Content-Type: application/json

{
  "name": "수정된 레스토랑명",
  "address": "수정된 주소",
  ...
}
```

#### 레스토랑 삭제
```
DELETE /api/restaurants/{id}
```

#### 요리 타입으로 검색
```
GET /api/restaurants/cuisine/{cuisine}
```

#### 평점으로 검색
```
GET /api/restaurants/rating/{rating}
```

#### 키워드로 검색
```
GET /api/restaurants/search?keyword={keyword}
```

#### 근처 레스토랑 검색
```
GET /api/restaurants/nearby?lat={latitude}&lng={longitude}&radius={radius}
```

#### 랜덤 레스토랑 추천
```
GET /api/restaurants/random
```

## 🗄️ 데이터베이스

### PostgreSQL 데이터베이스

- **URL**: `jdbc:postgresql://localhost:5432/restaurantdb`
- **Username**: `postgres`
- **Password**: `password`
- **Port**: `5432`

#### Docker를 사용한 PostgreSQL 실행

```bash
# PostgreSQL 컨테이너 실행
docker-compose up -d postgres

# pgAdmin (선택사항)
docker-compose up -d
```

#### 로컬 PostgreSQL 설치

```bash
# Homebrew로 PostgreSQL 설치
brew install postgresql@14

# PostgreSQL 서비스 시작
brew services start postgresql@14

# 데이터베이스 생성
createdb restaurantdb
```

### 초기 데이터

애플리케이션 시작 시 다음 샘플 데이터가 자동으로 로드됩니다:

- 맛있는 한식당 (한식)
- 이탈리안 피자 (이탈리안)
- 스시 마스터 (일식)
- 중국집 (중식)
- 스테이크 하우스 (양식)
- 베트남 쌀국수 (베트남)
- 인도 커리 (인도)
- 태국 음식점 (태국)
- 멕시칸 타코 (멕시칸)
- 프랑스 브라서리 (프랑스)

## ⚙️ 설정

### application.properties

```properties
# 서버 포트
server.port=8080

# PostgreSQL 데이터베이스 설정
spring.datasource.url=jdbc:postgresql://localhost:5432/restaurantdb
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=password

# JPA 설정
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## 🔧 개발

### 의존성 추가

`pom.xml`에 새로운 의존성을 추가하려면:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-{module}</artifactId>
</dependency>
```

### 새로운 엔티티 추가

1. `src/main/java/com/restaurant/backend/entity/` 디렉토리에 엔티티 클래스 생성
2. `src/main/java/com/restaurant/backend/repository/` 디렉토리에 Repository 인터페이스 생성
3. `src/main/java/com/restaurant/backend/controller/` 디렉토리에 Controller 클래스 생성

### 테스트

```bash
# 단위 테스트 실행
./mvnw test

# 통합 테스트 실행
./mvnw verify
```

## 🚀 배포

### Docker 이미지 생성

```bash
# Dockerfile 생성 후
docker build -t restaurant-backend .

# 컨테이너 실행
docker run -p 8080:8080 restaurant-backend
```

### JAR 파일 배포

```bash
# 빌드
./mvnw clean package

# 실행
java -jar target/restaurant-backend-0.0.1-SNAPSHOT.jar
```

## 📞 문의

백엔드 관련 문의사항이 있으시면 이슈를 생성해 주세요. 