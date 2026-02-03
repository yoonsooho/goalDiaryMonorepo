# React Native 앱 구조 설계

## 📱 개요

GoalDiary를 React Native로 네이티브 앱으로 개발하는 구조 설계입니다. 웹 앱과는 달리 하단 탭 네비게이션으로 각 기능을 분리합니다.

## 🏗️ 프로젝트 구조

```
todoDndMonoRepo/
├── apps/
│   ├── goalDiaryFront/          # 기존 Next.js 웹 앱
│   ├── goalDiaryBack/            # NestJS 백엔드
│   └── goalDiaryMobile/          # 새로 생성할 React Native 앱
│       ├── src/
│       │   ├── navigation/       # 네비게이션 설정
│       │   │   ├── AppNavigator.tsx
│       │   │   └── TabNavigator.tsx
│       │   ├── screens/          # 각 화면 컴포넌트
│       │   ├── components/       # 공통 컴포넌트
│       │   ├── hooks/            # 커스텀 훅
│       │   ├── api/              # API 호출
│       │   ├── types/            # TypeScript 타입
│       │   └── utils/            # 유틸리티 함수
│       ├── ios/
│       ├── android/
│       └── package.json
└── packages/
    └── types/                    # 공유 타입 (웹/모바일 공통)
```

## 📐 화면 구조

### 하단 탭 네비게이션 (Bottom Tab Navigator)

```
┌─────────────────────────────────┐
│         Header (공통)            │
├─────────────────────────────────┤
│                                 │
│      현재 선택된 화면            │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [일정] [루틴] [명언] [일기] [설정] │
└─────────────────────────────────┘
```

### 주요 화면

1. **일정 화면 (Schedules)**
    - 일정 목록
    - 일정 상세 (BIG3 스케줄링)
    - 일정 생성/수정

2. **루틴 화면 (Routines)**
    - 루틴 목록
    - 루틴 진행률
    - 루틴 생성/수정

3. **명언 화면 (Quotes)**
    - 명언 카드 3개
    - 명언 추가/수정/삭제

4. **일기 화면 (Diary)**
    - 일기 목록
    - 일기 작성/수정

5. **설정 화면 (Settings)**
    - 프로필
    - 팀 관리
    - 알림 설정
    - 로그아웃

## 🚀 React Native 프로젝트 생성

### 1. 프로젝트 초기화

```bash
cd apps
npx react-native@latest init GoalDiaryMobile --template react-native-template-typescript
cd GoalDiaryMobile
```

### 2. 필요한 패키지 설치

```bash
# 네비게이션
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# 상태 관리 및 API
npm install @tanstack/react-query axios

# UI 컴포넌트
npm install react-native-vector-icons
npm install @react-native-community/datetimepicker

# 유틸리티
npm install dayjs
npm install react-native-gesture-handler react-native-reanimated

# iOS 설정
cd ios && pod install && cd ..
```

## 📱 네비게이션 구조

### `src/navigation/TabNavigator.tsx`

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import SchedulesScreen from '../screens/SchedulesScreen';
import RoutinesScreen from '../screens/RoutinesScreen';
import QuotesScreen from '../screens/QuotesScreen';
import DiaryScreen from '../screens/DiaryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="Schedules"
        component={SchedulesScreen}
        options={{
          title: '일정',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Routines"
        component={RoutinesScreen}
        options={{
          title: '루틴',
          tabBarIcon: ({ color, size }) => (
            <Icon name="repeat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quotes"
        component={QuotesScreen}
        options={{
          title: '명언',
          tabBarIcon: ({ color, size }) => (
            <Icon name="format-quote" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{
          title: '일기',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

### `src/navigation/AppNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import ScheduleDetailScreen from '../screens/ScheduleDetailScreen';
import CreateScheduleScreen from '../screens/CreateScheduleScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';
import DiaryDetailScreen from '../screens/DiaryDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScheduleDetail"
          component={ScheduleDetailScreen}
          options={{ title: '일정 상세' }}
        />
        <Stack.Screen
          name="CreateSchedule"
          component={CreateScheduleScreen}
          options={{ title: '일정 만들기' }}
        />
        <Stack.Screen
          name="CreateRoutine"
          component={CreateRoutineScreen}
          options={{ title: '루틴 만들기' }}
        />
        <Stack.Screen
          name="DiaryDetail"
          component={DiaryDetailScreen}
          options={{ title: '일기 상세' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 📄 주요 화면 컴포넌트 구조

### `src/screens/SchedulesScreen.tsx`

```typescript
import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetSchedules } from '../hooks/api/useSchedules';

export default function SchedulesScreen() {
  const navigation = useNavigation();
  const { data: schedules, isLoading } = useGetSchedules();

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.scheduleItem}
            onPress={() => navigation.navigate('ScheduleDetail', { id: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>
              {item.startDate} ~ {item.endDate || '종료일 없음'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 일정이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scheduleItem: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
```

### `src/screens/RoutinesScreen.tsx`

```typescript
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useGetRoutines } from '../hooks/api/useRoutines';
import RoutineCard from '../components/RoutineCard';
import RoutineProgressBar from '../components/RoutineProgressBar';

export default function RoutinesScreen() {
  const { data: routines, isLoading } = useGetRoutines();

  return (
    <View style={styles.container}>
      <RoutineProgressBar />
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RoutineCard routine={item} />}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});
```

### `src/screens/QuotesScreen.tsx`

```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGetQuotes } from '../hooks/api/useQuotes';
import QuoteCard from '../components/QuoteCard';

export default function QuotesScreen() {
  const { data: quotes = [] } = useGetQuotes();
  const slots = Array(3)
    .fill(null)
    .map((_, i) => quotes[i] || null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {slots.map((quote, index) => (
        <QuoteCard key={quote?.id || `empty-${index}`} quote={quote} index={index} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
```

## 🔄 API 호출 구조

### `src/api/client.ts`

```typescript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = __DEV__
    ? "http://localhost:3000/api" // 개발 환경
    : "https://goaldiary.vercel.app/api"; // 프로덕션

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터: 토큰 추가
apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터: 토큰 갱신
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken } = response.data;
                await AsyncStorage.setItem("accessToken", accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // 리프레시 실패 시 로그인 화면으로 이동
                await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
                // navigation.navigate('Login');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
```

### `src/hooks/api/useSchedules.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";

export function useGetSchedules() {
    return useQuery({
        queryKey: ["schedules"],
        queryFn: async () => {
            const response = await apiClient.get("/schedules");
            return response.data;
        },
    });
}

export function useGetSchedule(id: number) {
    return useQuery({
        queryKey: ["schedules", id],
        queryFn: async () => {
            const response = await apiClient.get(`/schedules/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useCreateSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post("/schedules", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
        },
    });
}
```

## 🎨 공통 컴포넌트

### `src/components/RoutineCard.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface RoutineCardProps {
  routine: {
    id: number;
    title: string;
    description?: string;
    isActive: boolean;
    streak?: number;
  };
}

export default function RoutineCard({ routine }: RoutineCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        routine.isActive ? styles.activeCard : styles.inactiveCard,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{routine.title}</Text>
        {routine.isActive && (
          <Icon name="power" size={20} color="#10b981" />
        )}
      </View>
      {routine.description && (
        <Text style={styles.description}>{routine.description}</Text>
      )}
      {routine.streak && routine.streak > 0 && (
        <View style={styles.streakContainer}>
          <Icon name="local-fire-department" size={16} color="#f97316" />
          <Text style={styles.streak}>{routine.streak}일</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  inactiveCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streak: {
    fontSize: 12,
    color: '#f97316',
    marginLeft: 4,
    fontWeight: '600',
  },
});
```

## 🔐 인증 처리

### `src/screens/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;

      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);

      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## 📦 패키지 설치 명령어

```bash
# 필수 패키지
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @tanstack/react-query axios
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install dayjs

# iOS 전용
cd ios && pod install && cd ..
```

## 🎯 다음 단계

1. **프로젝트 생성 및 기본 설정**
2. **네비게이션 구조 구현**
3. **API 클라이언트 및 인증 처리**
4. **각 화면 컴포넌트 구현**
5. **공통 컴포넌트 개발**
6. **상태 관리 및 데이터 동기화**
7. **푸시 알림 설정**
8. **앱 스토어 배포 준비**

## 💡 웹 앱과의 차이점

1. **레이아웃**: 웹은 한 페이지에 모든 기능, 모바일은 탭으로 분리
2. **네비게이션**: 웹은 라우터, 모바일은 네이티브 네비게이션
3. **상태 관리**: 둘 다 React Query 사용 (공통)
4. **API**: 동일한 백엔드 사용
5. **타입**: `packages/types`에서 공유

이 구조로 진행하면 웹과 모바일을 동시에 개발하면서도 각 플랫폼에 최적화된 UX를 제공할 수 있습니다.
