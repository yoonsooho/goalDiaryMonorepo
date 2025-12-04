# Jest 테스트 완전 가이드 📚

## 목차

1. [테스트 기본 개념](#테스트-기본-개념)
2. [Jest 설정 파일 완전 이해](#jest-설정-파일-완전-이해)
3. [Jest 핵심 함수들](#jest-핵심-함수들)
4. [Jest 검증 함수들 (Matchers)](#jest-검증-함수들-matchers)
5. [테스트 생명주기 함수들](#테스트-생명주기-함수들)
6. [실제 테스트 예시](#실제-테스트-예시)
7. [테스트 실행 결과 분석](#테스트-실행-결과-분석)

---

## 테스트 기본 개념

### 1. 테스트란 무엇인가요?

테스트는 **코드가 예상대로 동작하는지 확인하는 코드**입니다. 마치 코드의 "품질 검사"와 같습니다.

```javascript
// 예시: 간단한 함수 테스트
function add(a, b) {
    return a + b;
}

// 테스트 코드
test("add 함수가 올바르게 작동하는지 확인", () => {
    expect(add(2, 3)).toBe(5); // 2 + 3 = 5인지 확인
    expect(add(0, 0)).toBe(0); // 0 + 0 = 0인지 확인
    expect(add(-1, 1)).toBe(0); // -1 + 1 = 0인지 확인
});
```

### 2. 테스트의 종류

1. **Unit Test (단위 테스트)**: 개별 함수나 컴포넌트를 테스트
2. **Integration Test (통합 테스트)**: 여러 컴포넌트가 함께 작동하는지 테스트
3. **E2E Test (End-to-End 테스트)**: 전체 애플리케이션을 사용자 관점에서 테스트

### 3. Jest란?

Jest는 JavaScript 테스트 프레임워크입니다. Facebook에서 만든 도구로, 다음과 같은 기능을 제공합니다:

-   **테스트 실행**: `npm test` 명령어로 모든 테스트 실행
-   **Assertion**: `expect().toBe()` 같은 검증 함수들
-   **Mocking**: 외부 의존성을 가짜로 만들어 테스트
-   **Coverage**: 코드가 얼마나 테스트되었는지 측정

### 4. 테스트 작성의 기본 패턴 (AAA 패턴)

```javascript
describe("함수 또는 컴포넌트 이름", () => {
    test("구체적인 테스트 케이스 설명", () => {
        // 1. 준비 (Arrange)
        const input = "테스트할 데이터";

        // 2. 실행 (Act)
        const result = 함수이름(input);

        // 3. 검증 (Assert)
        expect(result).toBe("예상하는 결과");
    });
});
```

---

## Jest 설정 파일 완전 이해

### Jest 설정 파일 구조

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
    dir: "./", // Next.js 앱의 루트 디렉토리
});

const customJestConfig = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: ["<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}", "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

module.exports = createJestConfig(customJestConfig);
```

### 설정 파일 상세 설명

#### 1. Next.js Jest 설정 불러오기

```javascript
const nextJest = require("next/jest");
```

-   **왜 필요한가?**: Next.js는 특별한 설정이 필요합니다 (JSX, CSS, 이미지 등 처리)
-   **nextJest**: Next.js에서 제공하는 Jest 설정 도우미 함수

#### 2. Next.js 설정 생성

```javascript
const createJestConfig = nextJest({
    dir: "./", // 현재 디렉토리가 프로젝트 루트
});
```

-   **dir: "./"**: Next.js 프로젝트의 루트 디렉토리 지정
-   **왜 필요한가?**: Next.js가 `next.config.js`, `.env` 파일 등을 찾기 위해

#### 3. 테스트 환경 설정

```javascript
testEnvironment: "jsdom",
```

-   **jsdom**: 브라우저 환경을 시뮬레이션하는 라이브러리
-   **왜 필요한가?**: React 컴포넌트는 `document`, `window` 같은 브라우저 객체를 사용
-   **다른 옵션들**:
    -   `node`: 서버 사이드 코드 테스트용
    -   `jsdom`: 브라우저 환경 시뮬레이션 (React 테스트용)

#### 4. 경로 매핑

```javascript
moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
},
```

-   **왜 필요한가?**: 코드에서 `@/components/Button` 같은 경로를 사용할 때
-   **정규표현식 설명**:
    -   `^@/`: `@/`로 시작하는
    -   `(.*)`: 그 뒤의 모든 문자를 캡처
    -   `$`: 문자열 끝
-   **매핑 결과**: `@/components/Button` → `src/components/Button`

#### 5. 테스트 파일 찾기 규칙

```javascript
testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}"
],
```

-   **첫 번째 패턴**: `src/` 폴더 안의 `__tests__` 폴더 안의 모든 파일
    -   예: `src/components/__tests__/Button.test.tsx`
-   **두 번째 패턴**: 파일명에 `.test.` 또는 `.spec.`이 포함된 파일
    -   예: `src/utils.test.ts`, `src/Button.spec.tsx`
-   **`**`\*\*: 모든 하위 폴더 포함
-   **`{js,jsx,ts,tsx}`**: JavaScript, JSX, TypeScript 파일들

#### 6. 테스트 제외 폴더

```javascript
testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/"
],
```

-   **`.next/`**: Next.js 빌드 결과물 (테스트할 필요 없음)
-   **`node_modules/`**: 외부 라이브러리들 (테스트할 필요 없음)

#### 7. `<rootDir>` 변수 설명

`<rootDir>`는 Jest에서 사용하는 **특별한 변수**입니다.

**의미:**

-   `<rootDir>` = 프로젝트의 루트 디렉토리 경로
-   실제 값 예시: `/Users/yunsuho/Desktop/codingfolder/nextjsdnd`

**왜 사용하나요?**

-   하드코딩하면 다른 환경에서 작동 안함
-   `<rootDir>` 사용하면 어떤 환경에서도 작동함

---

## Jest 핵심 함수들

### 1. `describe()` - 테스트 그룹화

```javascript
describe("그룹 이름", () => {
    // 관련된 테스트들을 여기에 넣음
});
```

-   **역할**: 관련된 테스트들을 논리적으로 그룹화
-   **중첩 가능**: `describe` 안에 `describe`를 넣을 수 있음
-   **테스트 결과**: 그룹별로 결과가 표시됨

### 2. `test()` 또는 `it()` - 개별 테스트

```javascript
test("테스트 설명", () => {
    // 테스트 로직
});

// 또는
it("테스트 설명", () => {
    // 테스트 로직
});
```

-   **`test`와 `it`**: 완전히 동일한 기능
-   **첫 번째 인자**: 사람이 읽기 쉬운 설명
-   **두 번째 인자**: 실제 테스트 로직을 담은 함수

---

## Jest 검증 함수들 (Matchers)

### 기본 Matchers

```javascript
// 정확히 같은 값
expect(result).toBe(expected);

// 객체나 배열의 내용이 같은지 (참조는 다를 수 있음)
expect(result).toEqual(expected);

// 배열에 특정 값이 포함되어 있는지
expect(array).toContain(item);

// 문자열에 특정 텍스트가 포함되어 있는지
expect(string).toContain("text");

// null인지 확인
expect(value).toBeNull();

// undefined인지 확인
expect(value).toBeUndefined();

// truthy 값인지 (true, 1, "hello" 등)
expect(value).toBeTruthy();

// falsy 값인지 (false, 0, "", null 등)
expect(value).toBeFalsy();
```

### 숫자 관련 Matchers

```javascript
// 크기 비교
expect(number).toBeGreaterThan(3);
expect(number).toBeGreaterThanOrEqual(3);
expect(number).toBeLessThan(5);
expect(number).toBeLessThanOrEqual(5);

// 근사값 확인 (부동소수점 오차 고려)
expect(0.1 + 0.2).toBeCloseTo(0.3);
```

### 문자열 관련 Matchers

```javascript
// 정규표현식 매칭
expect(string).toMatch(/hello/);

// 문자열이 특정 문자열로 시작하는지
expect(string).toMatch(/^hello/);

// 문자열이 특정 문자열로 끝나는지
expect(string).toMatch(/world$/);
```

---

## 테스트 생명주기 함수들

### 1. `beforeEach()` - 각 테스트 전에 실행

```javascript
describe("테스트 그룹", () => {
    let testData;

    beforeEach(() => {
        // 각 테스트가 실행되기 전에 실행됨
        testData = { name: "test", value: 42 };
    });

    test("첫 번째 테스트", () => {
        // testData가 초기화된 상태로 사용 가능
    });

    test("두 번째 테스트", () => {
        // testData가 다시 초기화된 상태로 사용 가능
    });
});
```

### 2. `afterEach()` - 각 테스트 후에 실행

```javascript
afterEach(() => {
    // 각 테스트가 끝난 후 정리 작업
    console.log("테스트 완료");
});
```

### 3. `beforeAll()` - 모든 테스트 전에 한 번만 실행

```javascript
beforeAll(() => {
    // 모든 테스트가 시작되기 전에 한 번만 실행
    console.log("테스트 시작");
});
```

### 4. `afterAll()` - 모든 테스트 후에 한 번만 실행

```javascript
afterAll(() => {
    // 모든 테스트가 끝난 후 한 번만 실행
    console.log("모든 테스트 완료");
});
```

---

## 실제 테스트 예시

### 1. 기본 함수 테스트 (cn 함수)

```javascript
import { cn } from "@/lib/utils";

describe("cn 함수 테스트", () => {
    test("두 개의 클래스명을 합칠 수 있다", () => {
        // Arrange (준비): 테스트할 데이터 준비
        const class1 = "text-red-500";
        const class2 = "font-bold";

        // Act (실행): 테스트할 함수 실행
        const result = cn(class1, class2);

        // Assert (검증): 결과가 예상과 같은지 확인
        expect(result).toBe("text-red-500 font-bold");
    });

    test("여러 개의 클래스명을 합칠 수 있다", () => {
        // Arrange: 배열로 여러 클래스 준비
        const classes = ["bg-white", "p-4", "rounded-lg"];

        // Act: spread operator(...)로 배열을 개별 인자로 전달
        const result = cn(...classes);

        // Assert: 결과 확인
        expect(result).toBe("bg-white p-4 rounded-lg");
    });

    test("빈 문자열을 처리할 수 있다", () => {
        // Arrange: 빈 문자열과 정상 클래스 준비
        const emptyString = "";
        const normalClass = "text-blue-500";

        // Act: 빈 문자열과 함께 함수 실행
        const result = cn(emptyString, normalClass);

        // Assert: 빈 문자열은 무시되고 정상 클래스만 남아야 함
        expect(result).toBe("text-blue-500");
    });

    test("조건부 클래스명을 처리할 수 있다", () => {
        // Arrange: 실제 사용 시나리오와 유사한 조건들
        const isActive = true; // 활성 상태
        const isDisabled = false; // 비활성 상태

        // Act: 조건에 따라 다른 클래스 적용
        const result = cn(
            "base-class", // 항상 적용되는 기본 클래스
            isActive && "active-class", // 조건이 true일 때만 적용
            isDisabled && "disabled-class" // 조건이 false이므로 적용 안됨
        );

        // Assert: 예상 결과 확인
        expect(result).toBe("base-class active-class");
    });
});
```

### 2. 브라우저 API 사용 함수 테스트 (getAccessTokenFromCookie)

```javascript
import { getAccessTokenFromCookie } from "@/lib/utils";

describe("getAccessTokenFromCookie 함수 테스트", () => {
    // beforeEach: 각 테스트 전에 실행되는 함수
    beforeEach(() => {
        // 각 테스트 전에 document.cookie를 초기화
        document.cookie = "";
    });

    test("쿠키에서 access_token을 찾을 수 있다", () => {
        // Arrange: 테스트용 쿠키 설정
        document.cookie = "access_token=abc123; other_cookie=value";

        // Act: 함수 실행
        const result = getAccessTokenFromCookie();

        // Assert: 결과 확인
        expect(result).toBe("abc123");
    });

    test("access_token이 없으면 null을 반환한다", () => {
        // Arrange: access_token이 없는 쿠키 설정
        document.cookie = "other_cookie=value; another_cookie=test";

        // Act: 함수 실행
        const result = getAccessTokenFromCookie();

        // Assert: null 반환 확인
        expect(result).toBeNull();
    });

    test("쿠키가 비어있으면 null을 반환한다", () => {
        // Arrange: 빈 쿠키 (이미 beforeEach에서 설정됨)

        // Act: 함수 실행
        const result = getAccessTokenFromCookie();

        // Assert: null 반환 확인
        expect(result).toBeNull();
    });

    test("여러 쿠키 중에서 access_token을 찾을 수 있다", () => {
        // Arrange: 여러 쿠키 설정
        document.cookie = "session_id=xyz789; access_token=token456; user_id=123";

        // Act: 함수 실행
        const result = getAccessTokenFromCookie();

        // Assert: 올바른 토큰 반환 확인
        expect(result).toBe("token456");
    });

    test("공백이 있는 쿠키를 처리할 수 있다", () => {
        // Arrange: 공백이 포함된 쿠키 설정
        document.cookie = " access_token = spaced_token ; other=value ";

        // Act: 함수 실행
        const result = getAccessTokenFromCookie();

        // Assert: 공백이 제거된 토큰 반환 확인
        expect(result).toBe("spaced_token");
    });
});
```

---

## 테스트 실행 결과 분석

### 성공한 테스트 결과

```
PASS src/lib/utils.test.ts
  cn 함수 테스트
    ✓ 두 개의 클래스명을 합칠 수 있다 (3 ms)
    ✓ 여러 개의 클래스명을 합칠 수 있다
    ✓ 빈 문자열을 처리할 수 있다
    ✓ 조건부 클래스명을 처리할 수 있다 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.389 s
```

**의미:**

-   **Test Suites: 1 passed**: 테스트 파일 1개가 성공
-   **Tests: 4 passed**: 총 4개의 테스트가 모두 성공
-   **Time: 0.389 s**: 테스트 실행 시간

### 테스트 결과 해석

-   **✓**: 테스트 통과
-   **✗**: 테스트 실패
-   **시간 표시**: 각 테스트의 실행 시간
-   **그룹별 표시**: `describe`로 그룹화된 테스트들이 계층적으로 표시

---

## 다음 단계

이제 기본적인 테스트 작성법을 익혔으니, 다음 단계로 넘어갈 수 있습니다:

1. **API 함수 테스트** (예: fetch를 사용하는 함수)
2. **React 컴포넌트 테스트** (예: Button 컴포넌트)
3. **Custom Hook 테스트** (예: useAuth 훅)
4. **Mock 사용법** (외부 의존성 가짜로 만들기)
5. **비동기 테스트** (Promise, async/await)

---

## 핵심 포인트 정리

1. **AAA 패턴**: Arrange → Act → Assert 순서로 테스트 작성
2. **describe로 그룹화**: 관련된 테스트들을 논리적으로 그룹화
3. **beforeEach 활용**: 테스트 간 격리를 위해 초기화 작업
4. **다양한 matcher 사용**: 상황에 맞는 적절한 검증 함수 선택
5. **엣지 케이스 테스트**: 정상 케이스뿐만 아니라 예외 상황도 테스트

이 가이드를 참고하여 점진적으로 더 복잡한 테스트를 작성해보세요! 🚀

---

## 테스트 실패 해결 과정 📝

### 실제 테스트 실패 사례와 해결 방법

#### 1. 테스트 실패 상황

```
FAIL src/lib/utils.test.ts
  getAccessTokenFromCookie 함수 테스트
    ✕ access_token이 없으면 null을 반환한다 (1 ms)
    ✕ 쿠키가 비어있으면 null을 반환한다 (1 ms)
    ✕ 여러 쿠키 중에서 access_token을 찾을 수 있다 (1 ms)

  ● getAccessTokenFromCookie 함수 테스트 › access_token이 없으면 null을 반환한다

    expect(received).toBeNull()

    Received: "abc123"
```

#### 2. 문제 분석

**문제점**: `beforeEach`에서 쿠키 초기화가 제대로 작동하지 않음

-   각 테스트 간에 쿠키가 남아있어서 이전 테스트의 결과가 영향을 미침
-   `document.cookie = ""`로는 쿠키가 완전히 제거되지 않음

#### 3. 해결 방법

**잘못된 방법:**

```javascript
beforeEach(() => {
    document.cookie = ""; // 이것만으로는 쿠키가 완전히 제거되지 않음
});
```

**올바른 방법:**

```javascript
beforeEach(() => {
    // 각 테스트 전에 document.cookie를 완전히 초기화
    // 모든 쿠키를 만료시켜서 제거
    document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
});
```

#### 4. 테스트 격리의 중요성

**테스트 격리란?**

-   각 테스트가 독립적으로 실행되어야 함
-   이전 테스트의 결과가 다음 테스트에 영향을 주면 안됨
-   테스트 순서가 바뀌어도 결과가 동일해야 함

**테스트 격리를 위한 방법들:**

1. **beforeEach/afterEach 사용**: 각 테스트 전후에 상태 초기화
2. **Mock 사용**: 외부 의존성을 가짜로 만들어 격리
3. **테스트 데이터 분리**: 각 테스트마다 독립적인 데이터 사용

#### 5. 테스트 실패 디버깅 과정

1. **에러 메시지 분석**: 어떤 값이 예상과 다른지 확인
2. **테스트 격리 확인**: 다른 테스트가 영향을 주는지 확인
3. **단계별 디버깅**: 각 단계별로 값을 출력해서 확인
4. **점진적 수정**: 한 번에 하나씩 문제를 해결

#### 6. 실제 해결 과정

**1단계: 문제 인식**

```
Received: "abc123"  // 이전 테스트의 쿠키가 남아있음
Expected: null      // 새로운 테스트에서는 null을 기대
```

**2단계: 원인 파악**

-   `beforeEach`에서 쿠키 초기화가 불완전함
-   `document.cookie = ""`는 쿠키를 제거하지 않음

**3단계: 해결책 적용**

-   쿠키를 만료시켜서 완전히 제거하는 방법 사용
-   각 쿠키를 개별적으로 만료시킴

**4단계: 검증**

-   테스트 재실행하여 문제 해결 확인
-   모든 테스트가 독립적으로 작동하는지 확인

### 테스트 실패 시 체크리스트 ✅

-   [ ] 에러 메시지를 자세히 읽었는가?
-   [ ] 예상값과 실제값의 차이를 파악했는가?
-   [ ] 테스트 격리가 제대로 되고 있는가?
-   [ ] beforeEach/afterEach가 올바르게 설정되었는가?
-   [ ] Mock이나 외부 의존성이 문제인가?
-   [ ] 테스트 순서가 결과에 영향을 주는가?

### 테스트 디버깅 팁 💡

1. **console.log 사용**: 테스트 중간에 값을 출력해서 확인
2. **단일 테스트 실행**: `npm test -- --testNamePattern="특정테스트이름"`
3. **테스트 순서 변경**: describe 블록 순서를 바꿔서 확인
4. **점진적 수정**: 한 번에 하나씩 문제를 해결

---

## 테스트 코드 이해하기 📖

### 실제 함수와 테스트 코드 매칭하기

#### 1. 테스트할 함수 분석

```javascript
// src/lib/utils.ts
export const getAccessTokenFromCookie = () => {
    if (typeof window !== "undefined") {
        // 브라우저 환경인지 확인
        const cookies = document.cookie.split(";"); // 쿠키를 세미콜론으로 나누기
        for (let cookie of cookies) {
            // 각 쿠키를 하나씩 확인
            const [name, value] = cookie.trim().split("="); // 쿠키 이름과 값 분리
            if (name === "access_token") {
                // 이름이 "access_token"인지 확인
                return value; // 맞으면 값 반환
            }
        }
    }
    return null; // 찾지 못했거나 브라우저가 아니면 null 반환
};
```

**함수가 하는 일:**

1. 브라우저 환경인지 확인
2. 모든 쿠키를 가져와서 세미콜론으로 나누기
3. 각 쿠키에서 이름이 "access_token"인 것을 찾기
4. 찾으면 그 값을 반환, 못 찾으면 null 반환

#### 2. 테스트 코드와 함수 동작 매칭

**테스트 1: 정상 케이스**

```javascript
test("쿠키에서 access_token을 찾을 수 있다", () => {
    // Arrange: 쿠키 설정
    document.cookie = "access_token=abc123; other_cookie=value";

    // Act: 함수 실행
    const result = getAccessTokenFromCookie();

    // Assert: 결과 확인
    expect(result).toBe("abc123");
});
```

**함수 실행 과정:**

1. `document.cookie.split(";")` → `["access_token=abc123", " other_cookie=value"]`
2. 첫 번째 쿠키: `"access_token=abc123"`
    - `cookie.trim().split("=")` → `["access_token", "abc123"]`
    - `name = "access_token"`, `value = "abc123"`
    - `name === "access_token"` → `true`
    - `return "abc123"` ✅

**테스트 2: 예외 케이스**

```javascript
test("access_token이 없으면 null을 반환한다", () => {
    // Arrange: access_token이 없는 쿠키 설정
    document.cookie = "other_cookie=value; another_cookie=test";

    // Act: 함수 실행
    const result = getAccessTokenFromCookie();

    // Assert: null 반환 확인
    expect(result).toBeNull();
});
```

**함수 실행 과정:**

1. `document.cookie.split(";")` → `["other_cookie=value", " another_cookie=test"]`
2. 첫 번째 쿠키: `"other_cookie=value"`
    - `name = "other_cookie"` ≠ `"access_token"` → 계속 진행
3. 두 번째 쿠키: `"another_cookie=test"`
    - `name = "another_cookie"` ≠ `"access_token"` → 계속 진행
4. 모든 쿠키 확인 완료 → `return null` ✅

#### 3. beforeEach의 역할 이해

```javascript
beforeEach(() => {
    // 각 테스트 전에 document.cookie를 완전히 초기화
    document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
});
```

**이 코드가 하는 일:**

1. 현재 있는 모든 쿠키를 가져옴
2. 각 쿠키를 하나씩 처리
3. 쿠키 이름을 추출
4. 그 쿠키를 과거 날짜로 만료시켜서 삭제

**왜 필요한가?**

-   각 테스트가 독립적으로 실행되어야 함
-   이전 테스트의 쿠키가 다음 테스트에 영향을 주면 안됨

#### 4. 쿠키 초기화 코드 상세 분석

```javascript
document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("="); // 등호 위치 찾기
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie; // 쿠키 이름 추출
    document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`; // 쿠키 삭제
});
```

**단계별 설명:**

1. **`document.cookie.split(";")`**: 쿠키를 세미콜론으로 나누기

    - 예: `"access_token=abc123; other_cookie=value"` → `["access_token=abc123", " other_cookie=value"]`

2. **`cookie.indexOf("=")`**: 등호(=) 위치 찾기

    - 예: `"access_token=abc123"` → `13` (등호 위치)

3. **`cookie.substr(0, eqPos)`**: 등호 앞부분(쿠키 이름) 추출

    - 예: `"access_token=abc123"` → `"access_token"`

4. **쿠키 삭제**: 과거 날짜로 만료시켜서 브라우저가 삭제하도록 함
    - `expires=Thu, 01 Jan 1970 00:00:00 GMT`: 1970년 1월 1일 (과거)
    - `path=/`: 모든 경로에서 삭제

#### 5. 테스트 작성 패턴 정리

**AAA 패턴 (Arrange-Act-Assert):**

1. **Arrange (준비)**: 테스트에 필요한 데이터 설정
2. **Act (실행)**: 테스트할 함수 실행
3. **Assert (검증)**: 결과가 예상과 같은지 확인

**테스트 케이스 종류:**

-   **정상 케이스**: 함수가 예상대로 작동하는 경우
-   **예외 케이스**: 함수가 예외 상황을 올바르게 처리하는 경우
-   **엣지 케이스**: 경계값이나 특수한 상황을 처리하는 경우

---

## 로그인 테스트 작성 과정 🔐

### 실제 프로젝트에서 로그인 테스트 작성하기

#### 1. 로그인 기능 구조 분석

로그인 기능은 여러 레이어로 구성되어 있습니다:

```
사용자 입력 (LoginForm)
    ↓
React Hook (useSignIn)
    ↓
API 함수 (signIn)
    ↓
서버 API (/api/auth/signin)
```

**각 레이어별 테스트:**

1. **API 함수 테스트**: 서버와의 통신 로직
2. **React Hook 테스트**: 상태 관리와 라우팅 로직
3. **React 컴포넌트 테스트**: 사용자 인터페이스

#### 2. API 함수 테스트 작성

```javascript
// authApi.test.ts
import { signIn, signUp, getUser, signOut } from "@/api/authApi";
import { commonApiJson } from "@/api/commonApi";

// Mock 설정
jest.mock("@/api/commonApi", () => ({
    commonApiJson: jest.fn(),
}));

const mockCommonApiJson = commonApiJson as jest.MockedFunction<typeof commonApiJson>;

describe("Auth API Functions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("올바른 로그인 데이터로 API를 호출할 수 있다", async () => {
        // Arrange: 테스트 데이터 준비
        const loginData = { userId: "testuser", password: "password123" };
        const mockResponse = { success: true, message: "로그인 성공" };

        // Mock 설정: API가 성공 응답을 반환하도록 설정
        mockCommonApiJson.mockResolvedValue(mockResponse);

        // Act: signIn 함수 실행
        const result = await signIn(loginData);

        // Assert: API 호출 확인
        expect(mockCommonApiJson).toHaveBeenCalledWith("/api/auth/signin", {
            method: "POST",
            body: loginData,
            requireAuth: false,
            credentials: "include",
        });

        // Assert: 결과 확인
        expect(result).toEqual(mockResponse);
    });
});
```

**핵심 포인트:**

-   **Mock 사용**: 외부 의존성(`commonApiJson`)을 가짜로 만들어 테스트
-   **API 호출 검증**: 올바른 파라미터로 호출되었는지 확인
-   **응답 검증**: 예상한 결과가 반환되었는지 확인

#### 3. React Hook 테스트 작성

```javascript
// useAuth.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSignIn } from "@/app/hooks/apiHook/useAuth";

// Mock 설정
jest.mock("@/api/authApi", () => ({
    signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("useSignIn Hook 테스트", () => {
    let queryClient: QueryClient;
    let mockPush: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock router 설정
        mockPush = jest.fn();
        mockUseRouter.mockReturnValue({
            push: mockPush,
            // ... 다른 router 메서드들
        } as any);

        // QueryClient 생성
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    test("로그인 성공 시 메인 페이지로 리다이렉트한다", async () => {
        // Arrange: 성공 응답 설정
        const loginData = { userId: "testuser", password: "password123" };
        const mockResponse = { success: true };

        mockSignIn.mockResolvedValue(mockResponse);

        // Act: Hook 사용
        const { result } = renderHook(() => useSignIn(), { wrapper });

        // Act: 로그인 실행
        await waitFor(() => {
            result.current.mutateAsync(loginData);
        });

        // Assert: 리다이렉트 확인
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/main");
        });
    });
});
```

**핵심 포인트:**

-   **renderHook**: React Hook을 테스트하기 위한 함수
-   **QueryClientProvider**: React Query를 사용하는 Hook을 테스트하기 위해 필요
-   **waitFor**: 비동기 작업이 완료될 때까지 기다림
-   **Mock Router**: Next.js router를 가짜로 만들어 라우팅 테스트

#### 4. 테스트 실패 해결 과정

**실제 발생한 문제들:**

1. **console.log 출력 문제**

```
console.log
Error: 로그인 실패
```

-   **원인**: 실제 코드에서 에러를 console.log로 출력
-   **해결**: 테스트에서는 정상적인 동작 (에러 처리 확인)

2. **useSignUp 테스트 실패**

```
Expected: {"email": "test@example.com", "password": "password123", "userId": "newuser"}
Received: {"client": {}, "meta": undefined, "mutationKey": undefined}
```

-   **원인**: React Query mutation의 파라미터 전달 방식 문제
-   **해결**: mutation 함수 호출 방식 수정 필요

3. **에러 처리 테스트 실패**

-   **원인**: 실제 에러가 발생해서 테스트가 중단됨
-   **해결**: 에러를 올바르게 처리하도록 테스트 수정

#### 5. 테스트 작성 시 주의사항

**Mock 설정의 중요성:**

```javascript
// 모든 외부 의존성을 Mock으로 설정
jest.mock("@/api/authApi", () => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    getUser: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));
```

**비동기 테스트 처리:**

```javascript
// waitFor를 사용해서 비동기 작업 완료 대기
await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith("/main");
});
```

**테스트 격리:**

```javascript
beforeEach(() => {
    jest.clearAllMocks(); // 각 테스트 전에 Mock 초기화
    queryClient = new QueryClient(); // 새로운 QueryClient 생성
});
```

#### 6. 로그인 테스트 체크리스트 ✅

-   [ ] API 함수가 올바른 파라미터로 호출되는가?
-   [ ] 성공 시 올바른 응답을 반환하는가?
-   [ ] 실패 시 에러를 올바르게 처리하는가?
-   [ ] 로그인 성공 시 리다이렉트가 발생하는가?
-   [ ] 로딩 상태가 올바르게 관리되는가?
-   [ ] 모든 외부 의존성이 Mock으로 설정되었는가?
-   [ ] 비동기 작업이 올바르게 처리되는가?

---

## 8. Mock의 작동 원리와 개념

### Mock이란?

-   **Mock**: 실제 함수나 모듈을 가짜로 교체하는 것
-   **목적**: 외부 의존성 없이 테스트하고 싶은 코드만 격리해서 테스트
-   **장점**: 빠른 실행, 예측 가능한 결과, 네트워크/서버 없이도 테스트 가능

### jest.mock()의 작동 원리

```javascript
// 1. 모듈을 Mock으로 교체
jest.mock("@/api/commonApi", () => ({
    commonApiJson: jest.fn(),
}));

// 2. Mock 함수의 동작 정의
mockCommonApiJson.mockResolvedValue(mockResponse);

// 3. 실제 코드 실행 (내부적으로는 Mock 사용)
const result = await signIn(loginData);

// 4. Mock이 반환한 값 확인
expect(result).toEqual(mockResponse);
```

### Mock vs 실제 함수

-   **실제 함수**: 서버에 실제 요청, 네트워크 필요, 응답 시간 불확실
-   **Mock 함수**: 가짜 응답 즉시 반환, 네트워크 불필요, 예측 가능한 결과

### Mock의 핵심: "가짜 응답"을 만드는 것

#### 실제 상황 vs 테스트 상황

```javascript
// 실제 상황 (Production)
const result = await signIn({ userId: "testuser", password: "password123" });
// 실제로는 서버에서 다양한 응답이 올 수 있음:
// { success: true, token: "abc123", user: {...} }
// { success: false, error: "비밀번호가 틀렸습니다" }
// Error: "서버 연결 실패"

// 테스트 상황 (Test)
const mockResponse = { success: true, message: "로그인 성공" };
mockCommonApiJson.mockResolvedValue(mockResponse);
const result = await signIn(loginData);
// result는 mockResponse와 같음: { success: true, message: "로그인 성공" }
```

#### Mock 작동 과정

1. **Mock 설정**: `mockCommonApiJson.mockResolvedValue(mockResponse)`
2. **실제 함수 실행**: `const result = await signIn(loginData)`
3. **Mock이 가짜 응답 반환**: 실제 서버 요청 없이 `mockResponse` 반환
4. **결과 확인**: `expect(result).toEqual(mockResponse)`

#### 왜 Mock을 사용하는가?

-   **실제 서버 요청의 문제점**:

    -   서버가 다운되어 있으면 테스트 실패
    -   네트워크가 느리면 테스트가 오래 걸림
    -   서버 응답이 바뀌면 테스트가 실패할 수 있음
    -   테스트할 때마다 서버에 부하를 줌

-   **Mock 사용의 장점**:
    -   항상 예측 가능한 응답
    -   빠른 실행 속도
    -   서버 상태와 무관하게 테스트 가능
    -   네트워크 없이도 테스트 가능

#### 다양한 Mock 응답 예시

```javascript
// 성공 케이스
const mockResponse = { success: true, message: "로그인 성공" };
mockCommonApiJson.mockResolvedValue(mockResponse);

// 실패 케이스
const mockError = new Error("사용자 ID 또는 비밀번호가 올바르지 않습니다");
mockCommonApiJson.mockRejectedValue(mockError);

// 다른 응답 형태
const mockResponse = {
    token: "abc123",
    user: { id: 1, name: "testuser" },
    expiresIn: 3600,
};
mockCommonApiJson.mockResolvedValue(mockResponse);
```

#### Mock의 핵심 개념

```javascript
// Mock = "가짜 함수"
// "실제 함수 대신 내가 만든 가짜 함수를 사용해!"

// 1. 실제 함수를 가짜로 교체
jest.mock("@/api/commonApi", () => ({
    commonApiJson: jest.fn(), // 가짜 함수 생성
}));

// 2. 가짜 함수의 동작 정의
mockCommonApiJson.mockResolvedValue(mockResponse);

// 3. 실제 코드 실행 (하지만 내부적으로는 가짜 함수 사용)
const result = await signIn(loginData);

// 4. 가짜 함수가 반환한 값 확인
expect(result).toEqual(mockResponse);
```

**결론**: Mock은 "가짜 응답을 만들어서 실제 함수의 동작을 테스트하는 것"입니다!

---

## 다음 단계: 고급 테스트 기법

이제 기본적인 테스트 작성법과 디버깅 방법을 익혔으니, 다음 단계로 넘어갈 수 있습니다:

1. **Mock 사용법** (외부 의존성 가짜로 만들기)
2. **비동기 테스트** (Promise, async/await)
3. **React 컴포넌트 테스트** (Testing Library 사용)
4. **Custom Hook 테스트**
5. **API 호출 테스트**
6. **테스트 커버리지 분석**
