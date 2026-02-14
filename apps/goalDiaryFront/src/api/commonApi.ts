import { getAccessTokenFromCookie } from "@/lib/utils";

/** refresh 진행 중일 때 그 Promise를 공유해서, 동시에 여러 번 refresh 호출되지 않게 함 (로테이션 시 이전 토큰 재사용 방지) */
let refreshPromise: Promise<boolean> | null = null;

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

    // 401 에러(Unauthorized)이고 인증이 필요한 API인 경우 토큰 재발급 시도
    if (response.status === 401 && requireAuth) {
        try {
            // 동시에 여러 요청이 401이면 refresh는 한 번만 실행 (로테이션 시 이전 토큰 재사용으로 403 방지)
            if (!refreshPromise) {
                refreshPromise = (async () => {
                    const refreshResponse = await fetch("/api/auth/refresh-token", {
                        method: "POST",
                        credentials: "include",
                    });
                    return refreshResponse.ok;
                })().finally(() => {
                    refreshPromise = null;
                });
            }
            const promiseToWait = refreshPromise;
            const refreshed = await promiseToWait;
            if (!refreshed) {
                window.location.href = "/";
                throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
            }
            const newToken = getAccessTokenFromCookie();
            if (newToken) headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, {
                method,
                headers,
                credentials,
                body: body ? JSON.stringify(body) : undefined,
            });
        } catch (refreshError) {
            refreshPromise = null;
            if ((refreshError as Error).message?.includes("로그인")) throw refreshError;
            console.error("토큰 재발급 중 에러:", refreshError);
            window.location.href = "/";
            throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
        }
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
