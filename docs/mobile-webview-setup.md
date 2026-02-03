# 모바일 WebView 배포 가이드

GoalDiary를 React Native WebView로 모바일 앱으로 배포하는 방법입니다.

## 📱 개요

기존 Next.js 웹 앱을 그대로 활용하여 React Native WebView로 감싸는 방식입니다. 이 방식의 장점:

- ✅ 기존 코드 100% 재사용
- ✅ 웹과 모바일 앱 동시 유지보수
- ✅ 빠른 개발 및 배포
- ✅ 반응형 CSS만 추가하면 모바일 최적화 완료

## 🏗️ 프로젝트 구조

```
todoDndMonoRepo/
├── apps/
│   ├── goalDiaryFront/     # 기존 Next.js 웹 앱
│   └── goalDiaryMobile/    # 새로 생성할 React Native WebView 앱
└── packages/
    └── types/              # 공유 타입
```

## 📦 React Native 프로젝트 생성

### 1. React Native 프로젝트 초기화

```bash
cd apps
npx react-native@latest init GoalDiaryMobile --template react-native-template-typescript
cd GoalDiaryMobile
```

또는 Expo를 사용하는 경우:

```bash
npx create-expo-app GoalDiaryMobile --template
cd GoalDiaryMobile
```

### 2. 필요한 패키지 설치

```bash
# WebView 패키지
npm install react-native-webview

# 네비게이션 (선택사항)
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# 네트워크 상태 확인 (선택사항)
npm install @react-native-community/netinfo

# iOS 빌드 도구 (macOS만)
cd ios && pod install && cd ..
```

## 💻 기본 WebView 컴포넌트

### `apps/goalDiaryMobile/src/App.tsx`

```typescript
import React, { useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';

const WEB_APP_URL = __DEV__
  ? 'http://localhost:3000' // 개발 환경
  : 'https://goaldiary.vercel.app'; // 프로덕션 환경

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = React.useState(true);
  const [isConnected, setIsConnected] = React.useState(true);

  React.useEffect(() => {
    // 네트워크 상태 모니터링
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      if (!state.isConnected) {
        Alert.alert('인터넷 연결 없음', '인터넷 연결을 확인해주세요.');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert('로딩 오류', '페이지를 불러오는 중 오류가 발생했습니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        // iOS 설정
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Android 설정
        androidHardwareAccelerationDisabled={false}
        // 인증 및 쿠키 처리
        thirdPartyCookiesEnabled={true}
        // 사용자 에이전트 설정 (선택사항)
        userAgent="GoalDiaryMobile/1.0"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
});
```

## 🔧 고급 기능

### 1. 네이티브와 웹 간 통신

WebView에서 네이티브 기능을 사용하려면 `postMessage`를 사용합니다.

**웹 앱에서 (Next.js):**

```typescript
// 네이티브 앱인지 확인
const isNativeApp = window.ReactNativeWebView !== undefined;

// 네이티브로 메시지 전송
if (isNativeApp) {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'SHARE', data: { title: 'GoalDiary' } })
  );
}
```

**React Native에서:**

```typescript
const handleMessage = (event: any) => {
  try {
    const message = JSON.parse(event.nativeEvent.data);
    switch (message.type) {
      case 'SHARE':
        // 네이티브 공유 기능 호출
        Share.share({ message: message.data.title });
        break;
    }
  } catch (error) {
    console.error('Message parsing error:', error);
  }
};

<WebView
  onMessage={handleMessage}
  // ... 기타 props
/>
```

### 2. 딥링크 처리

앱 내부 링크를 네이티브 네비게이션으로 처리:

```typescript
const handleShouldStartLoadWithRequest = (request: any) => {
  const { url } = request;
  
  // 외부 링크는 브라우저로 열기
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (!url.includes('goaldiary.vercel.app') && !url.includes('localhost')) {
      Linking.openURL(url);
      return false; // WebView에서 로드하지 않음
    }
  }
  
  return true; // WebView에서 로드
};

<WebView
  onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
  // ... 기타 props
/>
```

### 3. 뒤로가기 버튼 처리 (Android)

```typescript
import { BackHandler } from 'react-native';

React.useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true; // 이벤트 처리됨
    }
    return false; // 기본 동작 (앱 종료)
  });

  return () => backHandler.remove();
}, []);
```

## 📱 플랫폼별 설정

### iOS 설정

`apps/goalDiaryMobile/ios/GoalDiaryMobile/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <!-- 또는 특정 도메인만 허용 -->
  <key>NSExceptionDomains</key>
  <dict>
    <key>goaldiary.vercel.app</key>
    <dict>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
  </dict>
</dict>
```

### Android 설정

`apps/goalDiaryMobile/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application
  android:usesCleartextTraffic="true"
  ...>
  ...
</application>
```

## 🚀 빌드 및 배포

### 개발 환경 실행

```bash
# iOS
npm run ios

# Android
npm run android
```

### 프로덕션 빌드

```bash
# iOS
cd ios
xcodebuild -workspace GoalDiaryMobile.xcworkspace -scheme GoalDiaryMobile -configuration Release

# Android
cd android
./gradlew assembleRelease
```

### Expo를 사용하는 경우

```bash
# 빌드
eas build --platform ios
eas build --platform android

# 배포
eas submit --platform ios
eas submit --platform android
```

## ✅ 체크리스트

### 반응형 CSS 확인

- [x] ScheduleDetail 컴포넌트 모바일 최적화
- [x] Header 컴포넌트 모바일 네비게이션
- [x] 메인 페이지 반응형 개선
- [ ] 모달 컴포넌트 모바일 최적화
- [ ] 폼 컴포넌트 모바일 최적화
- [ ] 터치 영역 최소 44x44px 확인

### WebView 설정

- [ ] 쿠키 및 세션 관리 확인
- [ ] 인증 토큰 처리 확인
- [ ] WebSocket 연결 확인 (팀 협업 기능)
- [ ] 파일 업로드 기능 확인
- [ ] 카메라/갤러리 접근 확인 (필요시)

### 성능 최적화

- [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] 코드 스플리팅 확인
- [ ] 로딩 상태 표시
- [ ] 오프라인 상태 처리

## 🔍 문제 해결

### 쿠키가 저장되지 않는 경우

```typescript
<WebView
  sharedCookiesEnabled={true}
  thirdPartyCookiesEnabled={true}
  // iOS 추가 설정
  incognito={false}
/>
```

### WebSocket 연결 문제

Next.js의 WebSocket은 일반적으로 WebView에서 잘 작동합니다. 다만 네트워크 상태를 확인하고 재연결 로직을 추가하는 것이 좋습니다.

### 성능 이슈

- 이미지 최적화: Next.js Image 컴포넌트 사용
- 코드 스플리팅: 동적 import 활용
- 메모리 관리: 불필요한 리렌더링 방지

## 📚 참고 자료

- [React Native WebView 공식 문서](https://github.com/react-native-webview/react-native-webview)
- [Next.js 모바일 최적화 가이드](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Native 성능 최적화](https://reactnative.dev/docs/performance)
