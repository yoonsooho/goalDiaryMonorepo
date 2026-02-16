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
 * refresh는 미들웨어에서만 수행.
 * - access_token 없거나 ?refresh=1 쿼리가 있으면 백엔드 /auth/refresh 호출
 * - 성공 시 Set-Cookie 그대로 전달 후, ?refresh=1 제거한 같은 URL로 redirect
 * - 실패/403 시 쿠키 제거 후 "/"로 보냄
 */
export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

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
    const isRefreshQuery = searchParams.get("refresh") === "1";

    // access_token이 있고 refresh 플래그가 없으면 일반 흐름
    if (accessToken && !isRefreshQuery) {
        if (pathname === "/") return NextResponse.redirect(new URL("/main", request.url));
        return NextResponse.next();
    }

    // refresh_token이 없으면 refresh 불가 → 루트만 허용, 나머지는 "/"로
    if (!refreshToken) {
        if (pathname === "/") return NextResponse.next();
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 여기까지 왔다는 것은:
    // - access_token이 없고 refresh_token만 있거나
    // - ?refresh=1 쿼리가 붙어 있어 명시적으로 refresh를 요청한 경우
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        // 설정 문제면 그냥 홈으로 보냄 (무한 루프 방지)
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 백엔드에 refresh 요청 (미들웨어에서만 수행)
    const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
        },
    });

    // redirect 대상 URL: 현재 URL에서 ?refresh=1 제거
    const redirectUrl = new URL(request.url);
    if (redirectUrl.searchParams.get("refresh") === "1") {
        redirectUrl.searchParams.delete("refresh");
    }

    // 기본 redirect 응답 생성
    const response = NextResponse.redirect(
        refreshResponse.ok ? redirectUrl : new URL("/", request.url),
        { status: 302 }
    );

    if (refreshResponse.ok) {
        // 백엔드의 Set-Cookie를 그대로 전달
        const setCookies =
            typeof (refreshResponse.headers as any).getSetCookie === "function"
                ? (refreshResponse.headers as any).getSetCookie()
                : [refreshResponse.headers.get("set-cookie")].filter(Boolean) as string[];

        setCookies.forEach((cookie: string, i: number) => {
            if (i === 0) response.headers.set("Set-Cookie", cookie);
            else response.headers.append("Set-Cookie", cookie);
        });
    } else if (refreshResponse.status === 403) {
        // 무효 refresh 토큰이면 브라우저 쿠키 제거 후 홈으로
        clearAuthCookies(response);
    }

    return response;
}
