import { NextRequest, NextResponse } from "next/server";

/**
 * Refresh Token 갱신 API Route
 *
 * [구현 배경]
 * 프론트엔드와 백엔드가 다른 도메인으로 배포되는 경우, 브라우저에서 직접 백엔드 API를 호출하면
 * 쿠키 설정에 문제가 발생합니다.
 *
 * [문제점]
 * 1. CORS/SameSite 정책: 브라우저에서 외부 API로 직접 요청 시, 백엔드가 보낸 Set-Cookie 헤더가
 *    브라우저 보안 정책(CORS, SameSite 등) 때문에 무시될 수 있습니다.
 * 2. httpOnly 쿠키: refresh_token은 httpOnly로 설정되어 있어 JavaScript로 직접 설정할 수 없습니다.
 * 3. 도메인 불일치: 백엔드 도메인의 쿠키는 프론트엔드 도메인에서 읽을 수 없습니다.
 *
 * [해결 방법]
 * Next.js API Route를 프록시로 사용하여 같은 도메인으로 요청을 처리합니다.
 * - 브라우저 → Next.js API Route (같은 도메인) → 백엔드 API (외부 도메인)
 * - 같은 도메인 요청이므로 CORS/SameSite 제약이 없어 쿠키가 정상적으로 설정됩니다.
 * - 백엔드의 Set-Cookie 헤더를 그대로 브라우저로 전달하여 쿠키를 설정합니다.
 *
 * [대안 비교]
 * 1. CORS + 직접 쿠키 설정: httpOnly 쿠키는 JavaScript로 설정 불가능 (XSS 취약)
 * 2. 리버스 프록시 (Nginx): 인프라 복잡도 증가
 * 3. 현재 방식 (Next.js 프록시): 구현 간단, 쿠키 설정 확실, httpOnly 지원 ✅
 */
export async function POST(request: NextRequest) {
    try {
        // 1. 브라우저에서 이미 저장된 refresh_token 쿠키 읽기
        //    (이 쿠키는 로그인 시 백엔드에서 설정된 것)
        const refreshToken = request.cookies.get("refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error("NEXT_PUBLIC_API_URL 환경 변수가 설정되지 않았습니다");
        }

        // 2. 백엔드 API로 토큰 갱신 요청
        //    서버 사이드에서 실행되므로 CORS 제약 없이 요청 가능
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
                "Content-Type": "application/json",
            },
        });

        const responseData = await refreshResponse.json();

        // 3. Next.js 응답 생성
        const response = NextResponse.json(
            { success: refreshResponse.ok, data: responseData },
            { status: refreshResponse.status }
        );

        // 4. Set-Cookie는 **성공 시에만** 전달. 실패 시(403 등) 백엔드는 clearCookies로 쿠키 삭제 헤더를 보내는데,
        //    그걸 그대로 넘기면 브라우저에서 refresh_token까지 지워져서 완전 로그아웃됨.
        //    실패 시에는 쿠키를 건드리지 않아서, 사용자가 재시도하거나 다른 탭 결과를 기다릴 수 있게 함.
        if (refreshResponse.ok) {
            const setCookies =
                typeof refreshResponse.headers.getSetCookie === "function"
                    ? refreshResponse.headers.getSetCookie()
                    : [refreshResponse.headers.get("set-cookie")].filter(Boolean) as string[];
            setCookies.forEach((cookie, i) => {
                if (i === 0) response.headers.set("Set-Cookie", cookie);
                else response.headers.append("Set-Cookie", cookie);
            });
        }

        return response;
    } catch (error) {
        console.error("토큰 갱신 API 에러:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
