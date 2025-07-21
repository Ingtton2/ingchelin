# Vercel 배포 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 에서 가입/로그인
2. "New Project" 클릭
3. 프로젝트 이름: `ingchelin-restaurant`
4. 데이터베이스 비밀번호 설정 (기억해두세요!)
5. 지역 선택 (가까운 곳)

## 2. Supabase 데이터베이스 설정

1. Supabase 대시보드에서 "SQL Editor" 클릭
2. `supabase-setup.sql` 파일의 내용을 복사하여 실행
3. "Settings" → "Database"에서 연결 정보 확인

## 3. Vercel 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정하세요:

### 필수 환경변수:
```
DATABASE_URL=jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-supabase-password
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

### 환경변수 설정 방법:
1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Environment Variables" 클릭
3. 각 환경변수 추가:
   - `DATABASE_URL`: Supabase 연결 URL
   - `DATABASE_USERNAME`: postgres
   - `DATABASE_PASSWORD`: Supabase 데이터베이스 비밀번호
   - `CORS_ALLOWED_ORIGINS`: Vercel 도메인 URL

## 4. Supabase 연결 정보 찾기

1. Supabase 대시보드 → "Settings" → "Database"
2. "Connection string" 섹션에서 정보 복사
3. 형식: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres`

## 5. 백엔드 배포

### Railway 사용 (권장):
1. https://railway.app 에서 가입
2. GitHub 저장소 연결
3. 백엔드 폴더 선택
4. 환경변수 설정
5. 자동 배포

### 또는 Render 사용:
1. https://render.com 에서 가입
2. "New Web Service" 선택
3. GitHub 저장소 연결
4. 환경변수 설정
5. 배포

## 6. 프론트엔드 API URL 수정

백엔드가 배포되면 프론트엔드의 API URL을 수정해야 합니다:

```javascript
// src/services/api.js 또는 관련 파일에서
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com';
```

## 7. 최종 확인

1. Supabase 데이터베이스 연결 확인
2. 백엔드 API 테스트
3. 프론트엔드에서 백엔드 연결 확인
4. Vercel 배포 확인

## 문제 해결

### 데이터베이스 연결 오류:
- Supabase 연결 정보 확인
- 방화벽 설정 확인
- 환경변수 재설정

### CORS 오류:
- CORS_ALLOWED_ORIGINS 환경변수 확인
- 백엔드 CORS 설정 확인

### API 오류:
- 백엔드 로그 확인
- 환경변수 설정 확인
- 데이터베이스 스키마 확인 