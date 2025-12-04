import { cookies } from "next/headers";

/**
 * 서버 컴포넌트에서 사용할 수 있는 API 함수
 */
export const getPostsServer = async (scheduleId: number) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const headers: any = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?scheduleId=${scheduleId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        console.error("서버 API - 요청 실패:", response.status);
        return []; // 빈 배열 반환
    }

    return response.json();
};
