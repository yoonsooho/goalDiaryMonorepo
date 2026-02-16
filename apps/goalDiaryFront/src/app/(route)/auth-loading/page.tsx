"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function AuthLoadingContent() {
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "/main";

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/auth/refresh-token", {
                    method: "POST",
                    credentials: "include",
                });
                if (cancelled) return;
                if (res.ok) {
                    window.location.replace(redirectPath);
                } else {
                    window.location.replace("/");
                }
            } catch {
                if (!cancelled) window.location.replace("/");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [redirectPath]);

    return (
        <div className="min-h-screen bg-white" aria-hidden>
            <div className="sr-only">인증 갱신 중</div>
        </div>
    );
}

/**
 * refresh는 이 페이지에서만 수행. UI 없이 refresh 호출 후 바로 redirect.
 * - 미들웨어: access 없고 refresh 있으면 여기로 보냄
 * - commonApi 401: 여기로 보냄
 */
export default function AuthLoadingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <AuthLoadingContent />
        </Suspense>
    );
}
