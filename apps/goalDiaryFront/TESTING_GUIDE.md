# 로그인 테스트 가이드

이 프로젝트의 로그인 기능에 대한 포괄적인 테스트 코드가 작성되었습니다.

## 테스트 환경 설정

### 설치된 테스트 라이브러리

-   **Jest**: JavaScript 테스트 프레임워크
-   **React Testing Library**: React 컴포넌트 테스트
-   **@testing-library/user-event**: 사용자 상호작용 시뮬레이션
-   **@testing-library/jest-dom**: 추가 매처 함수들

### 테스트 실행 명령어

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

## 테스트 구조

### 1. API 함수 테스트 (`src/api/__tests__/authApi.test.ts`)

-   `signIn`, `signUp`, `getUser`, `signOut` 함수의 단위 테스트
-   API 호출 파라미터 검증
-   에러 처리 테스트

### 2. 컴포넌트 테스트 (`src/app/components/auth/__tests__/LoginForm.test.tsx`)

-   LoginForm 컴포넌트의 렌더링 테스트
-   폼 유효성 검사 테스트
-   사용자 상호작용 테스트
-   에러 상태 표시 테스트
-   로딩 상태 테스트

### 3. 훅 테스트 (`src/app/hooks/apiHook/__tests__/useAuth.test.tsx`)

-   `useSignIn`, `useSignUp`, `useGetUser`, `useSignOut` 훅 테스트
-   React Query와의 통합 테스트
-   라우터 네비게이션 테스트
-   토큰 기반 조건부 쿼리 테스트

### 4. 통합 테스트 (`src/app/components/auth/__tests__/LoginFlow.integration.test.tsx`)

-   전체 로그인 플로우 테스트
-   네트워크 에러 처리
-   서버 검증 에러 처리
-   중복 요청 방지 테스트

### 5. 미들웨어 테스트 (`src/__tests__/middleware.test.ts`)

-   인증 미들웨어의 라우팅 로직 테스트
-   토큰 기반 접근 제어 테스트
-   리다이렉션 로직 테스트

## 테스트 커버리지

테스트는 다음 영역을 포괄합니다:

### ✅ API 레이어

-   인증 API 함수들의 정상 동작
-   에러 처리
-   파라미터 검증

### ✅ 컴포넌트 레이어

-   UI 렌더링
-   폼 유효성 검사
-   사용자 상호작용
-   상태 관리

### ✅ 훅 레이어

-   React Query 통합
-   라우터 네비게이션
-   조건부 쿼리 실행

### ✅ 통합 플로우

-   전체 로그인 프로세스
-   에러 시나리오
-   네트워크 문제 처리

### ✅ 미들웨어

-   라우팅 보호
-   토큰 검증
-   리다이렉션 로직

## 테스트 실행 예시

```bash
# 특정 테스트 파일만 실행
npm test LoginForm.test.tsx

# 특정 테스트 패턴 실행
npm test -- --testNamePattern="로그인"

# 커버리지 리포트 확인
npm run test:coverage
```

## 모킹 전략

### API 모킹

-   `@/api/authApi`의 모든 함수를 모킹
-   실제 네트워크 요청 없이 테스트 실행

### Next.js 모킹

-   `next/navigation`의 `useRouter` 훅 모킹
-   라우터 네비게이션 동작 검증

### 쿠키 모킹

-   `document.cookie` 모킹
-   토큰 기반 인증 로직 테스트

## 추가 테스트 고려사항

향후 추가할 수 있는 테스트:

1. **E2E 테스트**: Playwright나 Cypress를 사용한 전체 사용자 플로우 테스트
2. **성능 테스트**: 로그인 응답 시간 및 메모리 사용량 테스트
3. **보안 테스트**: XSS, CSRF 등 보안 취약점 테스트
4. **접근성 테스트**: 스크린 리더 호환성 테스트

## 문제 해결

### 일반적인 문제들

1. **모킹 오류**: `jest.clearAllMocks()`를 각 테스트 전에 호출
2. **비동기 테스트**: `waitFor`를 사용하여 비동기 작업 완료 대기
3. **라우터 모킹**: Next.js 라우터의 모든 메서드를 모킹해야 함

### 디버깅 팁

```bash
# 상세한 테스트 출력
npm test -- --verbose

# 특정 테스트만 실행하여 디버깅
npm test -- --testNamePattern="특정 테스트명"
```
