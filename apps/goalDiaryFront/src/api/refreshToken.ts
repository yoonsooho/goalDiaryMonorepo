import { cookies } from "next/headers";

/**
 * 토큰 재발급 공통 함수
 * 서버 컴포넌트와 Route Handler에서 모두 사용 가능
 * @returns { accessToken: string, setCookieHeader: string } | null
 */
export async function refreshAccessToken(): Promise<{ accessToken: string; setCookieHeader: string } | null> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL 환경 변수가 설정되지 않았습니다");
    }

    // 외부 API로 토큰 갱신 요청
    const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!refreshResponse.ok) {
        return null;
    }

    // 백엔드 응답의 Set-Cookie 헤더에서 새로운 토큰 추출
    const setCookieHeaders = refreshResponse.headers.get("set-cookie");
    if (!setCookieHeaders) {
        return null;
    }

    // Set-Cookie 헤더에서 access_token 추출
    const cookieStrings = setCookieHeaders.split(",").map((cookie) => cookie.trim());
    for (const cookieString of cookieStrings) {
        if (cookieString.includes("access_token=")) {
            const tokenMatch = cookieString.match(/access_token=([^;]+)/);
            if (tokenMatch) {
                const accessToken = tokenMatch[1];
                return { accessToken, setCookieHeader: setCookieHeaders };
            }
        }
    }

    return null;
}
