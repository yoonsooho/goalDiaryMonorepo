# GoalDiary Mobile App (Expo)

GoalDiary의 React Native 모바일 앱입니다. Expo를 사용하여 개발되었습니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18
- Expo CLI 또는 Expo Go 앱 (모바일 디바이스)

### 설치

```bash
# 의존성 설치
npm install
```

### 실행

```bash
# 개발 서버 시작
npm start

# 또는 특정 플랫폼으로 실행
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
npm run web      # 웹 브라우저
```

### Expo Go 앱 사용

1. 스마트폰에 Expo Go 앱 설치 (iOS/Android)
2. `npm start` 실행
3. QR 코드를 스캔하여 앱 실행

## 📱 주요 기능

- 일정 관리 (BIG3 스케줄링)
- 루틴 추적
- 명언 관리
- 일기 작성
- 팀 협업

## 🏗️ 프로젝트 구조

```
src/
├── navigation/     # 네비게이션 설정
├── screens/        # 화면 컴포넌트
├── components/     # 공통 컴포넌트
├── hooks/         # 커스텀 훅
├── api/           # API 클라이언트
└── types/         # TypeScript 타입
```

## 📚 문서

자세한 내용은 `/docs/react-native-app-structure.md`를 참고하세요.

## 🔧 개발 환경 설정

### API URL 설정

`src/api/client.ts`에서 API URL을 설정할 수 있습니다:

```typescript
const API_BASE_URL = __DEV__
    ? "http://localhost:3001/api" // 개발 환경
    : "https://tododndback.onrender.com/"; // 프로덕션
```

### 로컬 개발 서버 연결

Android 에뮬레이터나 iOS 시뮬레이터에서 로컬 서버에 연결하려면:

- **Android**: `http://10.0.2.2:3001/api` 사용
- **iOS**: `http://localhost:3001/api` 사용
- **실제 디바이스**: 컴퓨터의 로컬 IP 주소 사용 (예: `http://192.168.1.100:3001/api`)

## 📦 빌드 및 배포

### 개발 빌드

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### 프로덕션 빌드

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

## 🎯 다음 단계

1. 각 화면 상세 구현
2. 일정 상세 화면 (BIG3 스케줄링) 구현
3. 푸시 알림 설정
4. 앱 스토어 배포 준비
