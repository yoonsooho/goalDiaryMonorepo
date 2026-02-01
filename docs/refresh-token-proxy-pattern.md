# Next.js API Route를 통한 Refresh Token 갱신 - 프록시 패턴

## 문제 상황

프론트엔드와 백엔드가 **다른 도메인**으로 배포되는 경우, 브라우저에서 직접 백엔드 API를 호출하면 쿠키 설정에 문제가 발생합니다.

### 발생하는 문제들

1. **CORS/SameSite 정책 문제**
   - 브라우저에서 외부 API로 직접 요청 시, 백엔드가 보낸 `Set-Cookie` 헤더가 브라우저 보안 정책(CORS, SameSite 등) 때문에 무시될 수 있습니다.
   - 특히 `sameSite: 'none'`은 `secure: true`와 함께 써야 하는데, 개발 환경에서는 HTTPS가 아닐 수도 있습니다.

2. **httpOnly 쿠키 설정 불가**
   - `refresh_token`은 보안을 위해 `httpOnly: true`로 설정되어 있습니다.
   - `httpOnly` 쿠키는 JavaScript로 직접 설정할 수 없어 XSS 공격을 방지합니다.
   - 하지만 브라우저에서 직접 외부 API를 호출하면 이 쿠키가 설정되지 않습니다.

3. **도메인 불일치**
   - 백엔드 도메인(예: `api.example.com`)의 쿠키는 프론트엔드 도메인(예: `app.example.com`)에서 읽을 수 없습니다.

## 해결 방법: Next.js API Route 프록시 패턴

### 구현 방식

```
브라우저 → Next.js API Route (같은 도메인) → 백엔드 API (외부 도메인)
```

Next.js API Route를 프록시로 사용하여 같은 도메인으로 요청을 처리합니다.

### 왜 이 방법이 작동하는가?

1. **같은 도메인 요청**: Next.js API Route(`/api/auth/refresh-token`)는 프론트엔드와 같은 도메인이므로, CORS/SameSite 제약이 없습니다.

2. **쿠키 설정 가능**: 같은 도메인에서 설정한 쿠키는 브라우저에 정상적으로 저장됩니다.

3. **httpOnly 지원**: 서버 사이드에서 쿠키를 설정하므로 `httpOnly` 옵션도 정상적으로 작동합니다.

### 구현 코드

```typescript
// apps/goalDiaryFront/src/app/api/auth/refresh-token/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // 1. 브라우저에서 이미 저장된 refresh_token 쿠키 읽기
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
        const response = NextResponse.json({ success: true, data: responseData });

        // 4. 백엔드 응답의 Set-Cookie 헤더를 그대로 브라우저로 전달
        //    같은 도메인에서 설정하므로 쿠키가 정상적으로 저장됨
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
```

### 백엔드 쿠키 설정

```typescript
// 백엔드에서 쿠키 설정
const refreshCookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    httpOnly: true, // XSS 방지
    path: '/',
};

res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);
```

## 대안 비교

### 1. CORS + 직접 쿠키 설정 ❌

```typescript
// 브라우저에서 직접 설정
document.cookie = `refresh_token=${token}; httpOnly`; // ❌ httpOnly는 JavaScript로 설정 불가
```

**문제점:**
- `httpOnly` 쿠키는 JavaScript로 설정할 수 없습니다.
- `refresh_token`을 클라이언트에 노출하면 XSS 공격에 취약합니다.

### 2. 리버스 프록시 (Nginx) ⚠️

```
브라우저 → Nginx (같은 도메인) → 백엔드 API
```

**장점:**
- 성능이 좋습니다.
- 쿠키 설정이 안정적입니다.

**단점:**
- 인프라 복잡도가 증가합니다.
- Nginx 설정이 필요합니다.

### 3. Next.js API Route 프록시 ✅ (현재 방식)

**장점:**
- 구현이 간단합니다.
- 쿠키 설정이 확실합니다.
- `httpOnly` 지원합니다.
- 추가 인프라 구성이 필요 없습니다.

**단점:**
- 추가 네트워크 홉이 발생합니다 (하지만 미미함).
- Next.js 서버 부하가 약간 증가합니다 (하지만 미미함).

## 결론

프론트엔드와 백엔드가 **다른 도메인**으로 배포되는 경우, Next.js API Route를 프록시로 사용하는 것이 가장 **간단하고 안전한 방법**입니다.

특히 `httpOnly` 쿠키를 사용해야 하는 경우(보안상 권장), 이 방법이 거의 유일한 해결책입니다.

## 참고사항

- 이 패턴은 Next.js뿐만 아니라 다른 프레임워크(Vercel Serverless Functions, AWS Lambda 등)에서도 동일하게 적용 가능합니다.
- 프론트엔드와 백엔드가 같은 도메인이라면 이 방법이 필요 없습니다.
- 프로덕션 환경에서는 HTTPS를 사용해야 `sameSite: 'none'`이 정상 작동합니다.
