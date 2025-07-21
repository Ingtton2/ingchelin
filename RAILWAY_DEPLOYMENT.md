# Railway 배포 가이드

## 1단계: Railway 계정 생성
1. https://railway.app 접속
2. GitHub로 로그인
3. "New Project" 클릭
4. "Deploy from GitHub repo" 선택
5. `ingchelin` 저장소 선택

## 2단계: 환경변수 설정
Railway 대시보드에서 다음 환경변수들을 설정하세요:

### 필수 환경변수:
```
DATABASE_URL=jdbc:postgresql://db.ddhrabdtbwzdmukbkixo.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=1234
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

### 환경변수 설정 방법:
1. Railway 프로젝트 대시보드에서 "Variables" 탭 클릭
2. "New Variable" 클릭하여 각 환경변수 추가
3. 모든 환경변수 설정 후 "Deploy" 버튼 클릭

## 3단계: 배포 확인
1. 배포가 완료되면 Railway에서 제공하는 URL 확인
2. 예: `https://your-app-name.railway.app`
3. 브라우저에서 `https://your-app-name.railway.app/api/restaurants` 접속하여 API 테스트

## 4단계: Vercel 배포 준비
Railway 배포가 완료되면 Vercel에서 프론트엔드 배포 시 다음 환경변수 설정:
```
REACT_APP_API_URL=https://your-railway-app-name.railway.app
```

## 문제 해결:
- 배포 실패 시: Railway 로그 확인
- 환경변수 오류: 철자 및 값 확인
- CORS 오류: CORS_ALLOWED_ORIGINS 값 확인 