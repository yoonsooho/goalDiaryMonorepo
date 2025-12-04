import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // public 경로는 미들웨어 적용 안함 (/ 페이지는 토큰 체크 필요)
    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/auth-loading") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/robots.txt" || // SEO 크롤링 허용
        pathname === "/sitemap.xml" // SEO 크롤링 허용
    ) {
        return NextResponse.next();
    }

    // 쿠키에서 access_token 확인
    const accessToken = request.cookies.get("access_token")?.value;

    // access_token이 있으면 처리
    if (accessToken) {
        // 로그인 페이지에 access_token으로 접근하면 메인으로 리다이렉트
        if (pathname === "/") {
            return NextResponse.redirect(new URL("/main", request.url));
        }
        // 다른 페이지는 그대로 진행
        return NextResponse.next();
    }

    // access_token이 없을 때만 refresh 시도

    // refresh_token이 있는지 확인
    const refreshToken = request.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
        // 이미 로그인 페이지면 그대로 진행
        if (pathname === "/") {
            return NextResponse.next();
        }
        // 다른 페이지면 로그인 페이지로 리다이렉트
        return NextResponse.redirect(new URL("/", request.url));
    }

    // refresh_token이 있으면 middleware에서 토큰 재발급 시도
    // 성공하면 쿠키를 설정하고 원래 페이지로 리다이렉트
    // 실패하면 auth-loading 페이지로 리다이렉트 (클라이언트에서 재시도)
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error("NEXT_PUBLIC_API_URL 환경 변수가 설정되지 않았습니다");
        }

        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
                "Content-Type": "application/json",
            },
        });

        if (refreshResponse.ok) {
            // 토큰 재발급 성공 - 쿠키 설정
            const setCookieHeaders = refreshResponse.headers.get("set-cookie");
            if (setCookieHeaders) {
                // 쿠키를 설정한 후, 같은 URL로 리다이렉트하여 새로운 요청을 만들어
                // 서버 컴포넌트에서 쿠키를 확실히 읽을 수 있도록 함
                const response = NextResponse.redirect(request.url);
                response.headers.set("Set-Cookie", setCookieHeaders);
                return response;
            }
        }
    } catch (error) {
        console.error("Middleware 토큰 재발급 실패:", error);
    }

    // 토큰 재발급 실패 시 auth-loading 페이지로 리다이렉트
    const redirectPath = pathname === "/" ? "/main" : request.nextUrl.pathname + request.nextUrl.search;
    const loadingUrl = new URL(`/auth-loading?redirect=${encodeURIComponent(redirectPath)}`, request.url);

    return NextResponse.redirect(loadingUrl);
}
