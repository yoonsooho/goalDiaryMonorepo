# 문제 해결 가이드

## java.lang.String cannot be cast to java.lang.Boolean 에러

### 에러 메시지

```
java.lang.String cannot be cast to java.lang.Boolean
```

### 원인

이 에러는 주로 **의존성 버전 불일치**로 발생합니다:

1. **Expo SDK와 React Navigation 패키지 버전 불일치**
    - Expo SDK 54와 호환되지 않는 React Navigation 버전 사용
    - `react-native-screens`, `react-native-gesture-handler` 등 관련 패키지 버전 불일치

2. **React Navigation과 Expo SDK 54의 호환성 문제** ([GitHub 이슈 #12847](https://github.com/react-navigation/react-navigation/issues/12847))
    - React Navigation의 boolean props (`headerShown`, `gestureEnabled` 등)가 문자열로 전달되는 문제
    - Android에서만 발생

### 해결 방법

#### 방법 1: Expo 의존성 자동 수정 (가장 효과적 - 권장!)

의존성 버전 불일치를 자동으로 수정:

```bash
# 1. 문제 진단
npx expo-doctor

# 2. 자동으로 의존성 버전 수정
npx expo install --fix
```

이 방법이 가장 빠르고 효과적입니다! Expo SDK와 호환되는 버전으로 자동 업데이트됩니다.

#### 방법 2: React Navigation boolean props 명시적 설정

React Navigation의 모든 boolean props를 명시적으로 boolean으로 설정:

```typescript
// AppNavigator.tsx
<Stack.Navigator
    screenOptions={{
        headerShown: true,  // 명시적으로 boolean
        gestureEnabled: true,  // 명시적으로 boolean
        animation: "default",
    }}
>
    <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
            headerShown: false,  // 명시적으로 boolean
            gestureEnabled: false,  // 명시적으로 boolean
        }}
    />
</Stack.Navigator>
```

**이미 적용됨**: `src/navigation/AppNavigator.tsx`와 `src/navigation/TabNavigator.tsx`에 적용 완료

#### 방법 3: app.json을 app.config.js로 변경

`app.json`을 삭제하고 `app.config.js`로 변경:

```javascript
// app.config.js
module.exports = {
    expo: {
        name: "GoalDiary",
        slug: "goaldiary-mobile",
    },
};
```

이렇게 하면 타입 캐스팅 문제를 피할 수 있습니다.

#### 방법 4: app.json 최소화

`app.json`을 최소한의 설정만 남기기:

```json
{
    "expo": {
        "name": "GoalDiary",
        "slug": "goaldiary-mobile"
    }
}
```

#### 방법 5: Expo Go 앱 완전 재설치

1. Expo Go 앱 완전 삭제
2. Play Store/App Store에서 최신 버전 재설치
3. 앱 데이터 및 캐시 삭제 확인

#### 방법 6: 프로젝트 캐시 완전 삭제

```bash
cd apps/GoalDiaryMobile
rm -rf node_modules .expo node_modules/.cache
npm install
npm start -- --clear
```

#### 방법 7: 다른 기기로 테스트

- 다른 스마트폰으로 테스트
- iOS 기기로 테스트 (가능하면)
- 특정 기기나 Expo Go 버전 호환 문제일 수 있음

#### 방법 8: Expo SDK 버전 확인

```bash
npx expo --version
```

현재 프로젝트의 Expo SDK 버전과 Expo Go 앱 버전이 일치하는지 확인하세요.

### 참고

이 에러가 계속 발생한다면:

- Expo Go 앱의 알려진 버그일 수 있음
- 개발 빌드(EAS Build) 사용을 고려해보세요
- 또는 다른 Expo 프로젝트와 비교해보세요

## Android 에뮬레이터 저장 공간 부족 에러

### 에러 메시지

```
Error: adb: failed to install ... Expo-Go-54.0.6.apk: Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE]
```

### 해결 방법

#### 방법 1: 에뮬레이터 저장 공간 확보 (권장)

```bash
# 에뮬레이터에서 불필요한 앱 삭제
adb shell pm list packages | grep -v "android\|google\|com.android" | cut -d: -f2 | xargs -n1 adb uninstall

# 또는 에뮬레이터 재시작
# Android Studio에서 에뮬레이터 종료 후 재시작
```

#### 방법 2: 에뮬레이터 설정 변경

1. Android Studio 열기
2. AVD Manager 열기 (Tools > Device Manager)
3. 에뮬레이터 옆의 연필 아이콘 클릭 (Edit)
4. "Show Advanced Settings" 클릭
5. "Internal Storage" 또는 "SD Card" 크기 늘리기 (예: 8GB → 16GB)
6. 에뮬레이터 재시작

#### 방법 3: 실제 디바이스 사용 (가장 간단)

1. 스마트폰에 **Expo Go** 앱 설치
    - iOS: App Store에서 "Expo Go" 검색
    - Android: Play Store에서 "Expo Go" 검색

2. 개발 서버 실행

    ```bash
    npm start
    ```

3. QR 코드 스캔
    - 터미널에 표시된 QR 코드를 Expo Go 앱으로 스캔
    - 또는 `i` 키를 눌러 iOS, `a` 키를 눌러 Android에서 열기

#### 방법 4: 에뮬레이터 완전 초기화

```bash
# 에뮬레이터 완전 삭제 후 재생성
# Android Studio > AVD Manager > 에뮬레이터 삭제 > 새로 생성
```

### 권장 사항

**실제 디바이스 사용을 권장합니다:**

- 더 빠른 실행 속도
- 실제 사용 환경과 동일
- 저장 공간 문제 없음
- 네트워크 연결이 더 안정적

### 로컬 개발 서버 연결 (실제 디바이스)

실제 디바이스에서 로컬 서버에 연결하려면:

1. 컴퓨터와 스마트폰이 같은 Wi-Fi에 연결되어 있어야 합니다
2. 컴퓨터의 로컬 IP 주소 확인:
    ```bash
    # macOS
    ifconfig | grep "inet " | grep -v 127.0.0.1
    ```
3. `src/api/client.ts`에서 개발 환경 URL 수정:
    ```typescript
    const API_BASE_URL = __DEV__
        ? "http://YOUR_LOCAL_IP:3001/api" // 예: 'http://192.168.1.100:3001/api'
        : "https://tododndback.onrender.com/";
    ```
