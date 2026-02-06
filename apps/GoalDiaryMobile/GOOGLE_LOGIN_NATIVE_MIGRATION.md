# Google 로그인 네이티브 방식 전환 가이드

현재 WebView 방식에서 네이티브 방식(`@react-native-google-signin/google-signin`)으로 전환하는 가이드입니다.

## 인증 플로우 비교

### 현재 방식: WebView 기반 OAuth

```
[모바일 앱]
    │
    │ 1. 사용자가 "Google로 로그인" 버튼 클릭
    │
    ▼
[WebView 모달 열림]
    │
    │ 2. WebView에서 백엔드 OAuth URL 로드
    │    GET https://tododndback.onrender.com/auth/google?mobile=true
    │
    ▼
[백엔드 서버]
    │
    │ 3. Passport Google Strategy로 Google OAuth 시작
    │    → Google 로그인 페이지로 리다이렉트
    │
    ▼
[Google OAuth 페이지 (WebView 내부)]
    │
    │ 4. 사용자가 Google 계정 선택 및 로그인
    │    (User-Agent 스푸핑으로 disallowed_useragent 에러 방지)
    │
    ▼
[Google 서버]
    │
    │ 5. 인증 완료 후 백엔드 콜백 URL로 리다이렉트
    │    GET https://tododndback.onrender.com/auth/google/callback?code=xxx
    │
    ▼
[백엔드 서버]
    │
    │ 6. Google에서 받은 code로 Access Token 교환
    │ 7. Google API로 사용자 정보 조회
    │ 8. DB에서 사용자 조회/생성
    │ 9. JWT (accessToken, refreshToken) 생성
    │
    │ 10. mobile=true 감지 → HTML 페이지 반환
    │     (ReactNativeWebView.postMessage로 토큰 전송)
    │
    ▼
[WebView (HTML 페이지)]
    │
    │ 11. JavaScript 실행:
    │     window.ReactNativeWebView.postMessage({
    │       type: 'GOOGLE_LOGIN_SUCCESS',
    │       accessToken: '...',
    │       refreshToken: '...'
    │     })
    │
    ▼
[모바일 앱 (onMessage 핸들러)]
    │
    │ 12. WebView 메시지 수신
    │ 13. 토큰을 AsyncStorage에 저장
    │ 14. WebView 모달 닫기
    │ 15. 메인 화면으로 이동
    │
    ▼
[로그인 완료]
```

**특징:**

- ✅ 백엔드 OAuth 플로우 재사용 (웹과 동일)
- ✅ 추가 패키지 최소화 (react-native-webview만)
- ❌ 매번 이메일/비밀번호 입력 필요
- ❌ 시스템 계정 자동 선택 불가
- ❌ Google 정책상 비권장 방식

---

### 전환할 방식: 네이티브 SDK 기반

```
[모바일 앱]
    │
    │ 1. 사용자가 "Google로 로그인" 버튼 클릭
    │
    ▼
[GoogleSignin.signIn() 호출]
    │
    │ 2. 네이티브 Google Sign-In SDK 실행
    │    → 시스템 계정 선택 UI 표시 (자동)
    │
    ▼
[시스템 계정 선택 화면]
    │
    │ 3. 사용자가 계정 선택 (또는 자동 선택)
    │    → 이미 로그인된 계정이면 바로 진행
    │
    ▼
[Google 서버]
    │
    │ 4. Google 인증 완료
    │ 5. ID Token 발급 (JWT 형식)
    │
    ▼
[모바일 앱]
    │
    │ 6. GoogleSignin.getTokens()로 ID Token 받기
    │
    │ 7. 백엔드로 ID Token 전송
    │    POST https://tododndback.onrender.com/auth/google/mobile
    │    Body: { idToken: "eyJhbGci..." }
    │
    ▼
[백엔드 서버]
    │
    │ 8. google-auth-library로 ID Token 검증
    │    - 서명 확인
    │    - audience 확인 (Web Client ID와 일치)
    │    - 만료 시간 확인
    │
    │ 9. ID Token에서 사용자 정보 추출
    │    - email, name, sub (Google User ID) 등
    │
    │ 10. DB에서 사용자 조회/생성
    │     - socialId + social로 조회
    │     - 없으면 새로 생성
    │
    │ 11. JWT (accessToken, refreshToken) 생성
    │
    │ 12. JSON 응답 반환
    │     { accessToken: "...", refreshToken: "..." }
    │
    ▼
[모바일 앱]
    │
    │ 13. 응답에서 토큰 받기
    │ 14. 토큰을 AsyncStorage에 저장
    │ 15. 메인 화면으로 이동
    │
    ▼
[로그인 완료]
```

**특징:**

- ✅ 시스템 계정 자동 선택 (UX 우수)
- ✅ Google 공식 SDK 사용 (정책 준수)
- ✅ 빠른 로그인 (이미 로그인된 경우)
- ✅ 보안 강화 (ID Token 검증)
- ❌ 네이티브 모듈 필요 (prebuild 필수)
- ❌ Google Cloud Console 설정 복잡 (SHA-1 등)

---

### 주요 차이점

| 항목                  | WebView 방식                             | 네이티브 방식                             |
| --------------------- | ---------------------------------------- | ----------------------------------------- |
| **인증 방식**         | 백엔드 OAuth 플로우 (Authorization Code) | 네이티브 SDK (ID Token)                   |
| **사용자 경험**       | 매번 이메일/비밀번호 입력                | 시스템 계정 자동 선택                     |
| **백엔드 엔드포인트** | `/auth/google/callback` (기존)           | `/auth/google/mobile` (새로 추가)         |
| **토큰 전달**         | HTML + postMessage                       | HTTP POST (JSON)                          |
| **Deep Link 필요**    | ✅ 필요 (goaldiary://auth/callback)      | ❌ 불필요 (SDK가 직접 처리)               |
| **Google 정책**       | 비권장                                   | 권장                                      |
| **설정 복잡도**       | 낮음                                     | 높음 (SHA-1 등)                           |
| **패키지**            | react-native-webview                     | @react-native-google-signin/google-signin |

## 왜 네이티브 방식이 어려운가?

플로우는 간단해 보이지만, 실제로는 **설정과 환경 문제** 때문에 복잡합니다.

### 1. Google Cloud Console 설정의 복잡도

**WebView 방식:**

- ✅ Web Client ID 하나만 있으면 됨
- ✅ Google Cloud Console에서 거의 설정 불필요

**네이티브 방식:**

- ❌ **Android OAuth Client ID** 별도 생성 필요
- ❌ **SHA-1 인증서 지문** 필수 (디버그/릴리즈 각각)
- ❌ **iOS OAuth Client ID** 별도 생성 필요 (iOS 배포 시)
- ❌ **Bundle ID / Package Name** 정확히 일치해야 함
- ❌ 설정 하나라도 틀리면 `DEVELOPER_ERROR` (코드 10) 발생

**실제 겪었던 문제:**

```
- SHA-1 지문이 디버그 키스토어와 릴리즈 키스토어가 다름
- Android Client ID와 Web Client ID를 혼동
- Google Cloud Console에서 설정 변경 후 반영 시간 지연
- 물리 기기와 에뮬레이터의 키스토어가 다름
```

### 2. Expo Managed Workflow의 제약

**WebView 방식:**

- ✅ Expo Go에서도 작동 (개발 중)
- ✅ `expo start`만으로 테스트 가능
- ✅ 네이티브 빌드 불필요

**네이티브 방식:**

- ❌ **Expo Go에서 작동 안 함** (네이티브 모듈 때문)
- ❌ **반드시 `npx expo prebuild` 필요**
- ❌ **반드시 `npx expo run:android` 또는 EAS Build 필요**
- ❌ 개발 중에도 네이티브 빌드 필요 (시간 소요)

**실제 겪었던 문제:**

```
- Expo Go에서 테스트 불가 → 매번 네이티브 빌드 필요
- prebuild 후에도 모듈 링킹 안 됨 → 재빌드 필요
- 물리 기기 테스트 시 WiFi ADB 연결 필요
```

### 3. 네이티브 모듈 링킹 문제

**WebView 방식:**

- ✅ JavaScript만으로 작동
- ✅ 네이티브 모듈 링킹 불필요

**네이티브 방식:**

- ❌ 네이티브 코드 컴파일 필요
- ❌ 모듈 링킹 실패 시 `TurboModuleRegistry.getEnforcing(...):RNGoogleSignin could not be found` 에러
- ❌ `prebuild --clean` 후에도 가끔 안 됨 → 재시도 필요

### 4. 환경별 설정 차이

**WebView 방식:**

- ✅ 개발/프로덕션 동일하게 작동
- ✅ 환경 변수 최소화

**네이티브 방식:**

- ❌ **디버그 키스토어 SHA-1** vs **릴리즈 키스토어 SHA-1** 다름
- ❌ EAS Build 시 자동 생성된 키스토어의 SHA-1도 다름
- ❌ 각 환경마다 Google Cloud Console에 SHA-1 등록 필요

**실제 겪었던 문제:**

```
- 로컬 개발: 디버그 키스토어 SHA-1 필요
- EAS Build: EAS가 생성한 키스토어 SHA-1 필요
- Google Play Console 업로드: 릴리즈 키스토어 SHA-1 필요
→ 총 3개의 SHA-1을 Google Cloud Console에 등록해야 함
```

### 5. 에러 메시지의 모호함

**WebView 방식:**

- ✅ 에러가 발생해도 원인 파악 상대적으로 쉬움
- ✅ 브라우저 개발자 도구로 디버깅 가능

**네이티브 방식:**

- ❌ `DEVELOPER_ERROR` (코드 10) → 원인 파악 어려움
    - SHA-1 문제?
    - Client ID 문제?
    - Package Name 문제?
    - OAuth Consent Screen 문제?
- ❌ Google Cloud Console 설정 변경 후 반영 시간 불명확
- ❌ 로그만으로는 원인 파악 어려움

### 6. 테스트의 어려움

**WebView 방식:**

- ✅ 에뮬레이터에서 바로 테스트 가능
- ✅ 물리 기기에서도 바로 테스트 가능
- ✅ 네이티브 빌드 불필요

**네이티브 방식:**

- ❌ 에뮬레이터: 네이티브 빌드 필요 (시간 소요)
- ❌ 물리 기기: WiFi ADB 연결 또는 USB 연결 필요
- ❌ 매번 변경사항마다 네이티브 빌드 필요

### 결론: 왜 WebView를 선택했나?

| 항목               | WebView 방식         | 네이티브 방식         |
| ------------------ | -------------------- | --------------------- |
| **설정 복잡도**    | ⭐ 낮음              | ⭐⭐⭐⭐⭐ 매우 높음  |
| **개발 속도**      | ⭐⭐⭐⭐⭐ 빠름      | ⭐⭐ 느림 (빌드 시간) |
| **디버깅 난이도**  | ⭐⭐ 쉬움            | ⭐⭐⭐⭐ 어려움       |
| **에러 원인 파악** | ⭐⭐ 쉬움            | ⭐⭐⭐⭐ 어려움       |
| **테스트 편의성**  | ⭐⭐⭐⭐⭐ 매우 편함 | ⭐⭐ 불편함           |

**네이티브 방식이 간단해 보이는 이유:**

- 플로우가 직관적 (단계가 적음)
- 코드가 간결함

**하지만 실제로는:**

- 설정이 복잡함 (Google Cloud Console)
- 환경별 차이 많음 (디버그/릴리즈)
- 디버깅이 어려움 (에러 메시지 모호)
- 테스트가 불편함 (네이티브 빌드 필요)

**그래서 WebView 방식을 선택한 이유:**

- 빠른 개발/테스트
- 설정 최소화
- 안정성 (이미 작동하는 방식)
- 배포 일정 맞추기

**나중에 네이티브로 전환할 때:**

- 시간 여유 있을 때
- Google Cloud Console 설정 완벽히 이해한 후
- 단계별로 천천히 진행

## Deep Link: WebView vs 네이티브 방식

### WebView 방식: Deep Link 필요 ✅

**왜 필요한가?**

- 백엔드 OAuth 플로우를 사용하므로 Google이 백엔드 콜백 URL로 리다이렉트
- 백엔드가 토큰을 생성한 후 **앱으로 돌아와야 함**
- Deep Link로 앱을 열고 토큰을 전달

**사용되는 Deep Link:**

```
goaldiary://auth/callback?accessToken=xxx&refreshToken=xxx
```

**처리 과정:**

1. 백엔드가 Deep Link 생성
2. WebView에서 이 URL로 리다이렉트 시도
3. 시스템이 GoalDiary 앱을 열도록 함
4. 앱의 `Linking` API가 Deep Link 수신
5. `LoginScreen.tsx`의 `handleDeepLink` 함수가 토큰 추출 및 저장

**필요한 코드:**

```typescript
// app.config.js
scheme: "goaldiary";

// LoginScreen.tsx
useEffect(() => {
    Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener("url", (event) => {
        handleDeepLink(event.url);
    });
    return () => subscription.remove();
}, []);

const handleDeepLink = async (url: string | null) => {
    if (!url?.startsWith("goaldiary://auth/callback")) return;
    // 토큰 추출 및 저장
};
```

---

### 네이티브 방식: Deep Link 불필요 ❌

**왜 불필요한가?**

- 네이티브 SDK가 **앱 내부에서 직접 처리**
- Google 인증이 완료되면 SDK가 콜백으로 **직접 ID Token 반환**
- 백엔드로 리다이렉트하는 과정이 없음
- 따라서 Deep Link로 앱으로 돌아올 필요가 없음

**처리 과정:**

1. `GoogleSignin.signIn()` 호출
2. 네이티브 SDK가 시스템 계정 선택 UI 표시
3. 사용자가 계정 선택
4. SDK가 **직접 ID Token 반환** (콜백 함수)
5. 앱이 ID Token을 받아서 백엔드로 전송
6. 백엔드가 JWT 반환
7. 앱이 토큰 저장 및 로그인 완료

**필요한 코드:**

```typescript
// Deep Link 관련 코드 전혀 불필요!

const handleGoogleLogin = async () => {
    // 1. SDK 호출
    await GoogleSignin.signIn();

    // 2. SDK가 직접 ID Token 반환 (콜백)
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;

    // 3. 백엔드로 전송
    const response = await apiClient.post("/auth/google/mobile", {
        idToken: idToken,
    });

    // 4. 토큰 저장 및 로그인 완료
    await AsyncStorage.multiSet([...]);
};
```

**제거할 코드:**

- ❌ `Linking.getInitialURL()`
- ❌ `Linking.addEventListener("url", ...)`
- ❌ `handleDeepLink` 함수
- ❌ `onShouldStartLoadWithRequest` (WebView 관련)
- ❌ `handleWebViewNavigationStateChange` (WebView 관련)

**정리:**

| 항목               | WebView 방식                                  | 네이티브 방식                      |
| ------------------ | --------------------------------------------- | ---------------------------------- |
| **Deep Link 필요** | ✅ 필요                                       | ❌ 불필요                          |
| **이유**           | 백엔드 OAuth 플로우 사용 → 앱으로 돌아와야 함 | SDK가 직접 처리 → 앱 내부에서 완료 |
| **코드 복잡도**    | 높음 (Deep Link 처리 필요)                    | 낮음 (SDK 콜백만 사용)             |

## 전환 전 체크리스트

### 1. Google Cloud Console 설정 확인

- [ ] Android OAuth Client ID 생성 완료
- [ ] iOS OAuth Client ID 생성 완료 (iOS 배포 시)
- [ ] Web Client ID 확인 (이미 있음: `300629547488-0vj2cp953fvgl9gms0c85apf66rkmaei.apps.googleusercontent.com`)
- [ ] SHA-1 인증서 지문이 Google Cloud Console에 등록되어 있는지 확인

### 2. 패키지 설치

```bash
cd apps/GoalDiaryMobile
pnpm add @react-native-google-signin/google-signin react-native-encrypted-storage
```

### 3. 네이티브 프로젝트 재생성 (필수)

```bash
npx expo prebuild --clean
```

## 전환 단계

### Step 1: LoginScreen.tsx 수정

**제거할 것:**

- `react-native-webview` import 및 WebView 관련 코드
- `GOOGLE_OAUTH_URL` 상수
- `getUserAgent()` 함수
- WebView 모달 관련 코드
- `handleWebViewMessage`, `handleWebViewNavigationStateChange`, `onShouldStartLoadWithRequest` 핸들러

**추가할 것:**

```typescript
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

// Google OAuth Web Client ID
const GOOGLE_WEB_CLIENT_ID = "300629547488-0vj2cp953fvgl9gms0c85apf66rkmaei.apps.googleusercontent.com";

useEffect(() => {
    GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        forceCodeForRefreshToken: false,
    });
}, []);

const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
        // Google Play Services 확인 (Android만)
        if (Platform.OS === "android") {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }

        // Google 로그인 시작
        await GoogleSignin.signIn();

        // ID Token 가져오기
        const tokens = await GoogleSignin.getTokens();
        const idToken = tokens.idToken;

        if (!idToken) {
            throw new Error("ID Token을 받을 수 없습니다.");
        }

        // 백엔드로 ID Token 전송하여 JWT 받기
        const response = await apiClient.post("/auth/google/mobile", {
            idToken: idToken,
        });

        const { accessToken, refreshToken } = response.data;

        if (!accessToken || !refreshToken) {
            throw new Error("토큰을 받아올 수 없습니다.");
        }

        // 토큰 저장
        await AsyncStorage.multiSet([
            ["accessToken", accessToken],
            ["refreshToken", refreshToken],
            ["tokenSource", "render"],
        ]);

        navigation.replace("MainTabs");
    } catch (error: any) {
        // 에러 처리 (기존 코드 참고)
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            Alert.alert("로그인 취소", "Google 로그인이 취소되었습니다.");
            return;
        }
        // ... 기타 에러 처리
    } finally {
        setIsGoogleLoading(false);
    }
};
```

### Step 2: 백엔드 확인

백엔드는 이미 `/auth/google/mobile` 엔드포인트가 있으므로 수정 불필요합니다.

### Step 3: 패키지 정리 (선택사항)

WebView 관련 패키지 제거:

```bash
pnpm remove react-native-webview
```

## 테스트 체크리스트

- [ ] Android 에뮬레이터에서 테스트
- [ ] Android 물리 기기에서 테스트
- [ ] iOS 시뮬레이터에서 테스트 (iOS 배포 시)
- [ ] iOS 물리 기기에서 테스트 (iOS 배포 시)
- [ ] 시스템 계정 자동 선택 확인
- [ ] 로그인 성공 후 토큰 저장 확인
- [ ] 로그인 성공 후 메인 화면 이동 확인

## 주의사항

1. **`npx expo prebuild --clean` 필수**: 네이티브 모듈을 사용하므로 반드시 실행해야 합니다.
2. **SHA-1 확인**: Android 물리 기기에서 `DEVELOPER_ERROR`가 발생하면 SHA-1 인증서 지문을 다시 확인하세요.
3. **Web Client ID 사용**: `GoogleSignin.configure`의 `webClientId`는 반드시 **Web Client ID**를 사용해야 합니다 (Android Client ID 아님).

## 롤백 방법

만약 문제가 생기면:

1. Git으로 WebView 방식 코드로 되돌리기
2. `pnpm remove @react-native-google-signin/google-signin react-native-encrypted-storage`
3. `pnpm add react-native-webview`

## 참고

- [@react-native-google-signin/google-signin 공식 문서](https://github.com/react-native-google-signin/google-signin)
- 기존 네이티브 방식 시도했던 코드는 Git 히스토리에서 확인 가능
