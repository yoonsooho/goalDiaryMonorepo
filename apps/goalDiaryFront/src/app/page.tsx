import { CheckCircle, Users, Target, Clock, BookOpen, MessageSquare, Calendar, Zap, TrendingUp } from "lucide-react";
import ClientAuthPage from "./components/ClientAuthPage";
import Image from "next/image";

export default function Home() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "GoalDiary",
        description:
            "BIG1/BIG2/BIG3를 먼저 선택하고 시간에 배치하는 혁신적인 일정 관리 플랫폼. 개인의 목표, 명언, 일기와 팀 협업을 하나로 통합했습니다.",
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
            "BIG3 우선순위 스케줄링",
            "실시간 팀 협업 기능",
            "루틴 추적 및 통계",
            "명언 및 일기 관리",
            "완전 무료 사용",
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
        keywords: "목표관리, 일정관리, BIG3, 우선순위, 일기앱, 개인성장, 팀협업, 작업일지, 생산성",
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Hero Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            {/* Left: Hero Content */}
                            <div className="flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6 w-fit">
                                    <Target className="h-4 w-4" />
                                    <span>BIG3 우선순위 스케줄링</span>
                                </div>
                                <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                                    <span className="text-blue-600">오늘의 핵심 3가지</span>
                                    <br />
                                    먼저 시간에 배치하기
                                </h1>
                                <p className="mt-6 text-xl leading-8 text-gray-600">
                                    일반 Todo처럼 체크만 하는 게 아니라,{" "}
                                    <strong className="text-gray-900">BIG1/BIG2/BIG3를 먼저 고르고</strong> → 그걸
                                    우선으로 시간 배정 → 나머지 작업을 주변에 배치하는{" "}
                                    <strong className="text-gray-900">혁신적인 일정 관리 방식</strong>입니다.
                                </p>

                                {/* Key Differentiator */}
                                <div className="mt-8 p-6 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">기존 일정 앱과의 차이점</h3>
                                            <p className="mt-2 text-gray-600 text-sm">
                                                하루에 해야 할 일이 많을 때, 무엇이 진짜 중요한지 한눈에 안 보였나요?
                                                GoalDiary는{" "}
                                                <strong>오늘 꼭 지켜야 할 핵심 3가지(BIG3)를 먼저 시간에 고정</strong>
                                                하고 나머지를 설계하는 일정 도구입니다.
                                            </p>
                                        </div>
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

                {/* How It Works Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">사용 방법</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                3단계로 오늘의 일정을 완벽하게 관리하세요
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    1
                                </div>
                                <div className="pt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 h-full">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">모든 일정 작성</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        그날 해야 할 모든 일을 자유롭게 쭉 적어보세요. 아무 제약 없이 먼저 생각나는 대로
                                        작성합니다.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    2
                                </div>
                                <div className="pt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 h-full">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">BIG3 선택</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        작성한 일정 중에서 <strong className="text-gray-900">BIG1, BIG2, BIG3</strong>를
                                        선택하세요. 오늘 꼭 지켜야 할 핵심 3가지를 명확히 합니다.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    3
                                </div>
                                <div className="pt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 h-full">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">시간에 배치하기</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        선택한 BIG3를{" "}
                                        <strong className="text-gray-900">먼저 캘린더에 시간으로 배치하고</strong>,
                                        나머지 일정을 그 주변에 배치합니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Screenshot */}
                        <div className="mt-16">
                            <div
                                className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200"
                                style={{ aspectRatio: "3414/1664", minHeight: "400px" }}
                            >
                                <Image
                                    src="/screenshots/schedule-detail.png"
                                    alt="일정 상세 페이지 - BIG3 스케줄링"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <p className="mt-4 text-center text-sm text-gray-500">
                                BIG1, BIG2, BIG3를 선택하고 시간에 배치하는 화면
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">주요 기능</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                개인 생산성과 팀 협업을 한 화면에서 관리하세요
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Schedule Management */}
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">스케줄 관리</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>BIG1/BIG2/BIG3 우선순위 설정</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>시간 교환 기능</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>오늘의 스케줄 타임라인</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Routine */}
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">루틴 추적</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>연속 달성 일수 (Streak)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>완료율 프로그레스 바</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>루틴 통계 조회</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Quote */}
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">명언 관리</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>3개의 명언 슬롯</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>저자 정보 및 링크</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>더 보기/접기 기능</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Diary */}
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">일기 작성</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>일기 작성 및 관리</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>시간 정보 포함</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>일기 목록 조회</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Team Collaboration */}
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
                                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">팀 협업</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>팀 생성 및 멤버 초대</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>실시간 일정 동기화 (WebSocket)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>팀 초대 알림 시스템</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>개인 일정 → 팀 일정 전환</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                                왜 GoalDiary를 선택해야 할까요?
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                기존 일정 관리 앱과는 다른 혁신적인 접근 방식
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Target className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">우선순위 명확화</h3>
                                <p className="text-gray-600">
                                    하루에 해야 할 일이 많을 때, 무엇이 진짜 중요한지 한눈에 보입니다. BIG3를 먼저
                                    선택하고 시간에 배치하여 우선순위가 흐려지지 않습니다.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">시간 관리 효율성</h3>
                                <p className="text-gray-600">
                                    중요한 일을 먼저 시간에 배치하고, 나머지 일정을 그 주변에 배치합니다. 그때그때
                                    일정이 끼어들면서 우선순위가 흐려지는 일이 없습니다.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">통합 관리</h3>
                                <p className="text-gray-600">
                                    일정, 루틴, 명언, 일기, 팀 협업까지 한 화면에서 관리할 수 있습니다. 개인 성장과 팀
                                    협업을 함께 달성하세요.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            지금 바로 GoalDiary를 시작해보세요
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-blue-100">
                            회원가입은 1분이면 완료됩니다. 신용카드 정보도 필요하지 않습니다. 무료로 시작하고, BIG3
                            스케줄링으로 오늘의 핵심을 먼저 잡아보세요.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircle className="h-5 w-5" />
                                <span>완전 무료</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircle className="h-5 w-5" />
                                <span>설치 불필요</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircle className="h-5 w-5" />
                                <span>즉시 사용 가능</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
