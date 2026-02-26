import { NextRequest, NextResponse } from "next/server";

/** 403 등으로 재로그인 유도 시, 브라우저의 인증 쿠키 제거 (무효 토큰 403 루프 방지) */
function clearAuthCookies(response: NextResponse) {
    const isProd = process.env.NODE_ENV === "production";
    const secure = isProd ? "; Secure" : "";
    response.headers.append(
        "Set-Cookie",
        `access_token=; Path=/; Max-Age=0${secure}; SameSite=${isProd ? "None" : "Lax"}`
    );
    response.headers.append(
        "Set-Cookie",
        `refresh_token=; Path=/; Max-Age=0; HttpOnly${secure}; SameSite=${isProd ? "None" : "Lax"}`
    );
}

/**
 * 라우트 보호 및 첫 페이지 라우팅만 담당.
 * - "/"에서 토큰이 있으면 "/main"으로 보냄
 * - 그 외 경로에서는 토큰이 없더라도 그대로 두고, 실제 API 호출 시 commonApi가 401/refresh를 처리
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/screenshots") ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml"
    ) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // 첫 화면 라우팅만 처리: 토큰이 있으면 "/"에서 "/main"으로 보냄
    if (pathname === "/") {
        if (accessToken || refreshToken) {
            return NextResponse.redirect(new URL("/main", request.url));
        }
        return NextResponse.next();
    }

    // 나머지 경로에서는 토큰 유무에 상관없이 그대로 통과.
    // 실제 인증/refresh 처리는 commonApi + /api/auth/refresh-token에서 수행.
    return NextResponse.next();
}
