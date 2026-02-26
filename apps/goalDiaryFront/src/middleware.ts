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
 * 라우트 보호 및 첫 페이지 라우팅 + 초기 토큰 갱신 담당.
 * - "/"에서 토큰이 있으면 "/main"으로 보냄
 * - 보호된 페이지에 처음 진입할 때 access_token이 없고 refresh_token만 있으면 여기서 한 번만 /auth/refresh 수행
 * - 이후 API 호출 중 만료는 commonApi가 조용히 /api/auth/refresh-token으로 처리
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

    // access_token이 있으면 그냥 통과
    if (accessToken) {
        return NextResponse.next();
    }

    // access_token, refresh_token 둘 다 없으면 보호된 페이지 접근 불가 → "/"로
    if (!refreshToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 여기까지 왔으면: access_token은 없고 refresh_token만 있는 상태 → 최초 진입 시 한 번 /auth/refresh 수행
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
        },
    });

    const response = NextResponse.redirect(
        refreshResponse.ok ? new URL(request.url) : new URL("/", request.url),
        { status: 302 }
    );

    if (refreshResponse.ok) {
        const setCookies =
            typeof (refreshResponse.headers as any).getSetCookie === "function"
                ? (refreshResponse.headers as any).getSetCookie()
                : ([refreshResponse.headers.get("set-cookie")].filter(Boolean) as string[]);

        setCookies.forEach((cookie: string, i: number) => {
            if (i === 0) response.headers.set("Set-Cookie", cookie);
            else response.headers.append("Set-Cookie", cookie);
        });
    } else if (refreshResponse.status === 403) {
        clearAuthCookies(response);
    }

    return response;
}
