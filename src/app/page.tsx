import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Zap, Shield } from "lucide-react";
import ClientAuthPage from "./components/ClientAuthPage";

export default function Home() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "GoalDiary",
        description:
            "개인의 목표, 명언, 일기와 팀 협업을 하나로 통합한 혁신적인 플랫폼입니다. 드래그 앤 드롭으로 작업을 관리하고, 개인 성장과 팀 성과를 동시에 달성하세요.",
        url: "https://goaldiary.vercel.app",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web Browser",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        softwareVersion: "1.0",
        datePublished: "2024-01-01",
        dateModified: new Date().toISOString().split("T")[0],
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "KRW",
            availability: "https://schema.org/InStock",
        },
        featureList: [
            "직관적인 칸반 보드 시스템",
            "실시간 팀 협업 기능",
            "완전 무료 사용",
            "빠른 작업 관리",
            "팀 협업 최적화",
            "안전한 데이터 관리",
        ],
        author: {
            "@type": "Organization",
            name: "GoalDiary Team",
            url: "https://goaldiary.vercel.app",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "150",
            bestRating: "5",
            worstRating: "1",
        },
        keywords: "목표관리, 일기앱, 개인성장, 칸반보드, 명언관리, 팀협업, 작업일지, 회고록",
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Hero Section */}
                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
                            {/* Left: Hero Content */}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                    <span className="text-blue-600">GoalDiary</span>로
                                    <br />
                                    목표와 성장을 기록하세요
                                </h1>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    개인의 목표, 명언, 일기와 팀 협업을 하나로 통합한 스마트 플랫폼입니다. 드래그 앤
                                    드롭으로 작업을 관리하고, 개인 성장과 팀 성과를 함께 달성하세요.
                                </p>

                                {/* Features */}
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-gray-700">직관적인 칸반 보드 시스템</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-gray-700">실시간 팀 협업 기능</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-gray-700">완전 무료 사용</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Auth Component */}
                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-md">
                                    <ClientAuthPage />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                왜 GoalDiary를 선택해야 할까요?
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                현대적인 팀을 위한 가장 직관적이고 효율적인 작업 관리 도구입니다.
                            </p>
                        </div>

                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                                <div className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <Zap className="h-5 w-5 flex-none text-blue-600" />
                                        빠른 작업 관리
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            드래그 앤 드롭으로 작업을 즉시 이동하고 우선순위를 조정하세요. 복잡한 설정
                                            없이 바로 사용할 수 있습니다.
                                        </p>
                                    </dd>
                                </div>

                                <div className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <Users className="h-5 w-5 flex-none text-blue-600" />팀 협업 최적화
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            여러 팀원이 동시에 작업하고 실시간으로 변경사항을 확인할 수 있습니다. 소통이
                                            원활한 협업 환경을 제공합니다.
                                        </p>
                                    </dd>
                                </div>

                                <div className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <Shield className="h-5 w-5 flex-none text-blue-600" />
                                        안전한 데이터 관리
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            모든 데이터는 안전하게 암호화되어 저장되며, 언제든지 백업하고 복원할 수
                                            있습니다.
                                        </p>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-16 sm:px-6 lg:px-8 bg-blue-600">
                    <div className="mx-auto max-w-7xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            지금 바로 GoalDiary를 시작해보세요
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
                            회원가입은 1분이면 완료됩니다. 신용카드 정보도 필요하지 않습니다.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
