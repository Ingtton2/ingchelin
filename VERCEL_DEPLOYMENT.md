# Vercel 배포 가이드

## 1단계: Vercel 프로젝트 생성
1. https://vercel.com 접속
2. GitHub로 로그인
3. "New Project" 클릭
4. `ingchelin` 저장소 선택
5. Framework Preset: "Create React App" 선택

## 2단계: Supabase Anon Key 확인
1. Supabase 대시보드 접속
2. "Settings" → "API" 클릭
3. "Project API keys" 섹션에서 `anon public` 키 복사

## 3단계: Vercel 환경변수 설정
Vercel 대시보드에서 다음 환경변수들을 설정하세요:

### 필수 환경변수:
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_SUPABASE_URL=https://ddhrabdtbwzdmukbkixo.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaHJhYmR0Ynd6ZG11a2JraXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjE4NTcsImV4cCI6MjA2ODYzNzg1N30.Z5QGluZn2yTPzkqNgklAKkegrPKaVrcAlu3eczMSISo
```

### 환경변수 설정 방법:
1. Vercel 프로젝트 대시보드에서 "Settings" 클릭
2. "Environment Variables" 탭 클릭
3. "Add New" 클릭하여 각 환경변수 추가
4. Production, Preview, Development 모두 체크

## 4단계: 배포 확인
1. "Deploy" 버튼 클릭
2. 배포 완료 후 제공되는 URL 확인
3. 예: `https://ingchelin.vercel.app`

## 5단계: 로컬 백엔드 실행 (중요!)
Vercel 배포 후에도 로컬에서 백엔드를 실행해야 합니다:
```bash
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=prod
```

## 문제 해결:
- API 연결 오류: 로컬 백엔드가 실행 중인지 확인
- CORS 오류: 백엔드 CORS 설정 확인
- 환경변수 오류: 철자 및 값 확인

## 주의사항:
- Vercel은 정적 파일만 호스팅하므로 백엔드는 별도로 실행 필요
- 로컬 백엔드가 실행되지 않으면 API 호출 불가
- 프로덕션 환경에서는 백엔드도 클라우드에 배포 권장 