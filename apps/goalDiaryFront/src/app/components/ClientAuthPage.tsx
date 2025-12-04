"use client";

import dynamic from "next/dynamic";
import { PageLoading } from "@/components/ui/loading";

const AuthPage = dynamic(() => import("./auth/AuthPage"), {
    ssr: false,
    loading: () => <PageLoading text="로그인 페이지를 로딩중입니다..." />,
});

export default function ClientAuthPage() {
    return <AuthPage />;
}
