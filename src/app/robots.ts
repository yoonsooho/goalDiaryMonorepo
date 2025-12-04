import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*", // 모든 검색엔진에게 적용
            allow: "/", // 루트 경로는 크롤링 허용
            disallow: ["/api/", "/auth-loading/"], // API와 로딩 페이지는 크롤링 금지
        },
        sitemap: "https://goaldiary.vercel.app/sitemap.xml", // 사이트맵 위치 알려줌
    };
}
