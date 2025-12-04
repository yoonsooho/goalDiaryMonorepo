import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // refresh_token 쿠키에서 가져오기
        const refreshToken = request.cookies.get("refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
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

        const responseData = await refreshResponse.json();

        // 백엔드 응답의 쿠키를 브라우저로 전달
        const response = NextResponse.json({ success: true, data: responseData });

        // 백엔드 응답의 Set-Cookie 헤더를 그대로 전달
        const setCookieHeaders = refreshResponse.headers.get("set-cookie");
        if (setCookieHeaders) {
            response.headers.set("Set-Cookie", setCookieHeaders);
        }

        return response;
    } catch (error) {
        console.error("토큰 갱신 API 에러:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
