/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return {
            // 1) 내부 Next API 라우트를 먼저 매칭 (프록시보다 우선)
            beforeFiles: [
                { source: "/api/auth/refresh-token", destination: "/api/auth/refresh-token" },
                { source: "/api/cron", destination: "/api/cron" },
            ],
            // 2) 필요 시 afterFiles에 정적/특정 경로 재작성 추가 가능 (현재 없음)
            afterFiles: [],
            // 3) 나머지 /api/* 요청은 백엔드로 프록시 (폴백)
            fallback: [{ source: "/api/:path*", destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` }],
        };
    },
};

export default nextConfig;
