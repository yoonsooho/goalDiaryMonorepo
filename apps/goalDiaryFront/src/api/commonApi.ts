import { getAccessTokenFromCookie } from "@/lib/utils";

/** refresh는 미들웨어에서만. 401이면 현재 URL에 ?refresh=1 붙여서 이동 → 미들웨어가 refresh 후 같은 URL로 redirect (중간 화면 없음) */
function redirectForRefresh() {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    // 이미 refresh=1이면 또 설정만 하고, 동일 URL로 한 번만 이동
    url.searchParams.set("refresh", "1");
    window.location.href = url.toString();
}

interface CommonApiOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: HeadersInit;
    body?: any;
    credentials?: RequestCredentials;
    requireAuth?: boolean; // 인증이 필요한 API인지 여부
}

/**
 * 자동 토큰 재발급 기능이 포함된 공통 API 함수
 * @param url - 요청할 URL
 * @param options - fetch 옵션
 * @returns Promise<Response>
 */
export const commonApi = async (url: string, options: CommonApiOptions = {}): Promise<Response> => {
    const { method = "GET", headers: customHeaders = {}, body, credentials = "include", requireAuth = true } = options;

    // 기본 헤더 설정
    let headers: any = {
        "Content-Type": "application/json",
        ...customHeaders,
    };

    // 인증이 필요한 API의 경우 토큰 추가
    if (requireAuth) {
        const token = getAccessTokenFromCookie();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    // 첫 번째 요청
    let response = await fetch(url, {
        method,
        headers,
        credentials,
        body: body ? JSON.stringify(body) : undefined,
    });

    // 401이면 현재 URL에 ?refresh=1만 붙여서 이동 → 미들웨어가 refresh 후 같은 페이지로 redirect
    if (response.status === 401 && requireAuth) {
        redirectForRefresh();
        const err = new Error("인증이 만료되었습니다. 다시 로그인해주세요.") as Error & { status?: number };
        err.status = 401;
        throw err;
    }

    return response;
};

/**
 * commonApi를 사용한 JSON 응답 처리 함수
 * @param url - 요청할 URL
 * @param options - API 옵션
 * @returns Promise<any>
 */
export const commonApiJson = async (url: string, options: CommonApiOptions = {}): Promise<any> => {
    const response = await commonApi(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
    }

    return response.json();
};
