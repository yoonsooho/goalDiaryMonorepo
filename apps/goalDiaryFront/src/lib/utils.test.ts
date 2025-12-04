// utils.test.ts - utils.ts 파일의 함수들을 테스트하는 파일

// 1. 테스트할 함수를 import
import { cn, getAccessTokenFromCookie } from "@/lib/utils";
import "@testing-library/jest-dom"; // Jest DOM matcher 타입 추가

// 2. describe: 관련된 테스트들을 그룹화하는 함수
//    첫 번째 인자: 그룹의 이름 (테스트 결과에서 보여짐)
//    두 번째 인자: 테스트들을 포함하는 함수
describe("cn 함수 테스트", () => {
    // 3. test: 개별 테스트 케이스를 정의하는 함수
    //    첫 번째 인자: 테스트의 설명 (사람이 읽기 쉬운 설명)
    //    두 번째 인자: 실제 테스트 로직을 담은 함수
    test("두 개의 클래스명을 합칠 수 있다", () => {
        // AAA 패턴 사용:
        // Arrange (준비): 테스트할 데이터 준비
        const class1 = "text-red-500";
        const class2 = "font-bold";

        // Act (실행): 테스트할 함수 실행
        const result = cn(class1, class2);

        // Assert (검증): 결과가 예상과 같은지 확인
        // expect: Jest의 검증 함수
        // toBe: 정확히 같은 값인지 확인
        expect(result).toBe("text-red-500 font-bold");
    });

    // 4. 두 번째 테스트: 여러 개의 클래스명 테스트
    test("여러 개의 클래스명을 합칠 수 있다", () => {
        // Arrange: 배열로 여러 클래스 준비
        const classes = ["bg-white", "p-4", "rounded-lg"];

        // Act: spread operator(...)로 배열을 개별 인자로 전달
        const result = cn(...classes);

        // Assert: 결과 확인
        expect(result).toBe("bg-white p-4 rounded-lg");
    });

    // 5. 세 번째 테스트: 빈 문자열 처리
    test("빈 문자열을 처리할 수 있다", () => {
        // Arrange: 빈 문자열과 정상 클래스 준비
        const emptyString = "";
        const normalClass = "text-blue-500";

        // Act: 빈 문자열과 함께 함수 실행
        const result = cn(emptyString, normalClass);

        // Assert: 빈 문자열은 무시되고 정상 클래스만 남아야 함
        expect(result).toBe("text-blue-500");
    });

    // 6. 네 번째 테스트: 조건부 클래스명 (실제 사용 예시)
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

// 7. 새로운 함수 테스트: getAccessTokenFromCookie
describe("getAccessTokenFromCookie 함수 테스트", () => {
    // beforeEach: 각 테스트 전에 실행되는 함수
    beforeEach(() => {
        // 각 테스트 전에 document.cookie를 완전히 초기화
        // 모든 쿠키를 만료시켜서 제거
        document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
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
        document.cookie = "session_id=xyz789";
        document.cookie = "access_token=token456";
        document.cookie = "user_id=123";

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
