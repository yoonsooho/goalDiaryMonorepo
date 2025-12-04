import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "GoalDiary - 목표와 일기를 함께하는 스마트 작업관리",
    description:
        "GoalDiary는 개인의 목표, 명언, 일기와 팀 협업을 하나로 통합한 혁신적인 플랫폼입니다. 드래그 앤 드롭 칸반보드로 작업을 관리하고, 개인 성장과 팀 성과를 동시에 달성하세요.",
    keywords: [
        "목표관리",
        "일기앱",
        "개인성장",
        "칸반보드",
        "명언관리",
        "팀협업",
        "작업일지",
        "회고록",
        "GoalDiary",
        "개인목표달성",
    ],
    authors: [{ name: "GoalDiary Team" }],
    creator: "GoalDiary",
    publisher: "GoalDiary",
    openGraph: {
        title: "GoalDiary - 목표와 일기를 함께하는 스마트 작업관리",
        description: "개인의 목표, 명언, 일기와 팀 협업을 하나로 통합한 혁신적인 플랫폼",
        url: "https://goaldiary.vercel.app/",
        siteName: "GoalDiary",
        locale: "ko_KR",
        type: "website",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "GoalDiary - 목표와 일기를 함께하는 작업 관리 도구",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "GoalDiary - 목표와 일기를 함께하는 스마트 작업관리",
        description: "개인의 목표, 명언, 일기와 팀 협업을 하나로 통합한 혁신적인 플랫폼",
        images: ["/og-image.jpg"],
    },
    verification: {
        google: "JxjjD7DM8P_qMCHuPj4jjk7qqIk8iGFA2td5hWndwh8",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                <Providers>{children}</Providers>
                <Toaster />
            </body>
        </html>
    );
}
