import { getAccessTokenFromCookie } from "@/lib/utils";

// 동시에 여러 요청이 401을 맞아도 refresh는 한 번만 수행하도록 하는 전역 Promise
let refreshPromise: Promise<void> | null = null;

async function silentRefresh() {
    if (typeof window === "undefined") return;
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const res = await fetch("/api/auth/refresh-token", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error("토큰 갱신 실패");
            }
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
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

    // 401이면 조용히 refresh를 한 번 시도한 뒤, 원래 요청을 한 번만 재시도
    if (response.status === 401 && requireAuth) {
        try {
            await silentRefresh();
        } catch {
            // refresh도 실패하면 홈으로 보내고 에러 발생
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
            const err = new Error("인증이 만료되었습니다. 다시 로그인해주세요.") as Error & { status?: number };
            err.status = 401;
            throw err;
        }

        // 새 access_token이 발급되었을 가능성이 있으므로 Authorization 헤더를 갱신해서 한 번만 재시도
        if (requireAuth) {
            const newToken = getAccessTokenFromCookie();
            if (newToken) {
                headers.Authorization = `Bearer ${newToken}`;
            } else {
                // refresh는 성공했다고 나왔는데 토큰이 없으면 비정상 상태 → 로그아웃 처리
                if (typeof window !== "undefined") {
                    window.location.href = "/";
                }
                const err = new Error("인증 정보가 유효하지 않습니다. 다시 로그인해주세요.") as Error & { status?: number };
                err.status = 401;
                throw err;
            }
        }

        response = await fetch(url, {
            method,
            headers,
            credentials,
            body: body ? JSON.stringify(body) : undefined,
        });

        // 재시도 후에도 401/403이면 더 이상 시도하지 않고 로그아웃 처리
        if (response.status === 401 || response.status === 403) {
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
            const err = new Error("인증이 만료되었습니다. 다시 로그인해주세요.") as Error & { status?: number };
            err.status = response.status;
            throw err;
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
