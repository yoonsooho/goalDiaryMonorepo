"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoading } from "@/components/ui/loading";

// 동적 렌더링 강제 설정 (빌드 에러 방지)
export const dynamic = "force-dynamic";

function AuthLoadingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/main";

    useEffect(() => {
        const refreshToken = async () => {
            try {
                const response = await fetch("/api/auth/refresh-token", {
                    method: "POST",
                    credentials: "include",
                });

                if (response.ok) {
                    // 히스토리에서 완전히 제거하기 위해 window.location.replace 사용
                    window.location.replace(redirectUrl);
                } else {
                    window.location.replace("/");
                }
            } catch (error) {
                window.location.replace("/");
            }
        };

        refreshToken();
    }, [router, redirectUrl]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">인증 처리 중...</h2>
                <p className="text-gray-500">잠시만 기다려주세요. 로그인 정보를 확인하고 있습니다.</p>
            </div>
        </div>
    );
}

export default function AuthLoadingPage() {
    return (
        <Suspense fallback={<PageLoading text="인증 정보를 확인중입니다..." />}>
            <AuthLoadingContent />
        </Suspense>
    );
}
