import { cookies } from "next/headers";

/**
 * 서버(Server Component, Route Handler)에서 인증이 필요한 API 호출 시 사용.
 *
 * - refresh는 하지 않음. 쿠키의 access_token만 넣어서 요청하고, 401이면 그대로 실패 처리.
 * - 이유: 서버에서 refresh 해도 새 토큰을 브라우저 쿠키에 심어줄 수 없음.
 * - 401이 나오면 빈 값/에러 반환하고, 클라이언트가 commonApi로 다시 요청할 때 commonApi가 refresh 후 재시도함.
 */
export async function serverFetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    return fetch(url, { ...options, headers });
}

/**
 * 서버 컴포넌트에서 사용할 수 있는 API 함수 (인증 필요 시 serverFetchWithAuth 사용)
 */
export const getPostsServer = async (scheduleId: number) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return [];

    const response = await serverFetchWithAuth(`${baseUrl}/posts?scheduleId=${scheduleId}`, {
        method: "GET",
    });

    if (!response.ok) {
        console.error("서버 API - 요청 실패:", response.status);
        return [];
    }

    return response.json();
};
