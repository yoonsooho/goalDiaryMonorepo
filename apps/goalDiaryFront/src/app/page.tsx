import { CheckCircle, Users, Target, Clock, BookOpen, MessageSquare, Calendar, Zap, TrendingUp } from "lucide-react";
import HeroSection from "./components/HeroSection";
import { LetterDropReveal } from "./components/LetterDropReveal";
import { PopInOnScroll } from "./components/PopInOnScroll";
import { ScrollReveal } from "./components/ScrollReveal";
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
        // aggregateRating은 실제 사용자 리뷰 데이터가 있을 때만 사용해야 함
        // 현재는 리뷰 시스템이 없으므로 제거
        // 향후 리뷰 시스템 구축 시 실제 데이터로 교체 필요
        keywords: "목표관리, 일정관리, BIG3, 우선순위, 일기앱, 개인성장, 팀협업, 작업일지, 생산성",
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <HeroSection />

                {/* 사용 방법: 왼쪽 제목 sticky, 오른쪽 1·2·3 카드 가로 배치. 스크롤 시 왼쪽 고정 → 오른쪽 다 지나가면 같이 사라짐 */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
                    <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
                        {/* 왼쪽: 스크롤해도 고정, 다 내려가면 섹션과 함께 사라짐 */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                                <LetterDropReveal text="사용 방법" />
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                3단계로 오늘의 일정을 완벽하게 관리하세요
                            </p>
                        </div>

                        {/* 오른쪽: 1·2·3 카드 세로 + 스크린샷 (스크롤되면 위로 사라짐) */}
                        <div className="space-y-16">
                            <div className="space-y-8">
                                <div className="group">
                                    <div className="relative transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:-translate-y-1">
                                        <div className="absolute -top-4 -left-4 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            1
                                        </div>
                                        <div className="pt-10 px-8 pb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-sm transition-all duration-300 ease-out group-hover:shadow-xl group-hover:border-blue-200">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3">모든 일정 작성</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            그날 해야 할 모든 일을 자유롭게 쭉 적어보세요. 아무 제약 없이 먼저 생각나는 대로
                                            작성합니다. 할 일, 하고 싶은 일, 해야 할 일을 구분하지 말고 먼저 머릿속을 비우는
                                            것이 중요합니다. 리스트가 길어도 괜찮습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="relative transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:-translate-y-1">
                                        <div className="absolute -top-4 -left-4 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            2
                                        </div>
                                        <div className="pt-10 px-8 pb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-sm transition-all duration-300 ease-out group-hover:shadow-xl group-hover:border-blue-200">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3">BIG3 선택</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            작성한 일정 중에서 <strong className="text-gray-900">BIG1, BIG2, BIG3</strong>를
                                            선택하세요. 오늘 꼭 지켜야 할 핵심 3가지를 명확히 합니다. 나머지는 이 세 가지를
                                            지키고 나서 할 수 있는 만큼 하면 됩니다. 우선순위가 뚜렷해지면 하루가 덜 혼란스럽습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="relative transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:-translate-y-1">
                                        <div className="absolute -top-4 -left-4 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            3
                                        </div>
                                        <div className="pt-10 px-8 pb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-sm transition-all duration-300 ease-out group-hover:shadow-xl group-hover:border-blue-200">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3">시간에 배치하기</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            선택한 BIG3를{" "}
                                            <strong className="text-gray-900">먼저 캘린더에 시간으로 배치하고</strong>,
                                            나머지 일정을 그 주변에 배치합니다. 중요한 일에 먼저 시간을 할당하면, 그날의 골격이
                                            잡히고 예상치 못한 일이 끼어들어도 핵심만은 지킬 수 있습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
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
                    </div>
                </section>

                {/* Features Section */}
                {/* 주요 기능: 왼쪽 sticky, 오른쪽 카드 스크롤 */}
                <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                                <LetterDropReveal text="주요 기능" />
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                개인 생산성과 팀 협업을 한 화면에서 관리하세요
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ease-out h-full flex flex-col hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">스케줄 관리</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    BIG1·BIG2·BIG3로 시간에 먼저 배치. 시간 교환·드래그 순서 변경 지원.
                                </p>
                                <ul className="space-y-1.5 text-gray-600 text-sm mt-auto">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>우선순위 설정 · 타임라인 뷰</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ease-out h-full flex flex-col hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">루틴 추적</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    매일 습관 등록·체크. 연속 달성 일수(Streak)와 완료율을 한눈에.
                                </p>
                                <ul className="space-y-1.5 text-gray-600 text-sm mt-auto">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>프로그레스 바 · 통계 조회</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ease-out h-full flex flex-col hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">명언 관리</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    명언 최대 3개 저장. 메인에서 매일 보고, 저자·출처도 함께 관리.
                                </p>
                                <ul className="space-y-1.5 text-gray-600 text-sm mt-auto">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>슬롯 3개 · 더보기/접기</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ease-out h-full flex flex-col hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">일기 작성</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    그날의 생각·경험을 일기로. 작성 시각 자동 저장으로 나중에 돌아보기 쉽게.
                                </p>
                                <ul className="space-y-1.5 text-gray-600 text-sm mt-auto">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>작성·수정·삭제 · 목록 조회</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ease-out h-full flex flex-col sm:col-span-2 lg:col-span-1 hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">팀 협업</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    팀 생성·멤버 초대 후 일정 공유. 실시간 동기화, 개인→팀 전환 가능.
                                </p>
                                <ul className="space-y-1.5 text-gray-600 text-sm mt-auto">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>초대·알림 · WebSocket 동기화</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 왜 GoalDiary: 왼쪽 sticky, 오른쪽 3카드 가로 */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
                    <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                                <LetterDropReveal text="왜 GoalDiary를 선택해야 할까요?" />
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                기존 일정 관리 앱과는 다른 혁신적인 접근 방식
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-left transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 hover:bg-white">
                                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                                    <Target className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">우선순위 명확화</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    하루에 해야 할 일이 많을 때, 무엇이 진짜 중요한지 한눈에 보이지 않았나요? GoalDiary는 BIG3를 먼저 선택하고 시간에 배치하게 해서 우선순위가 흐려지지 않습니다. 나머지 일은 “BIG3를 지킨 뒤” 할 수 있는 만큼만 하면 됩니다.
                                </p>
                            </div>
                            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-left transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 hover:bg-white">
                                <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                                    <Clock className="h-7 w-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">시간 관리 효율성</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    중요한 일을 먼저 시간에 배치하고, 나머지 일정을 그 주변에 채웁니다. 그때그때 일정이 끼어들어도 이미 골격이 잡혀 있어서 우선순위가 흐려지지 않고, 오늘 꼭 할 일만 놓치지 않을 수 있습니다.
                                </p>
                            </div>
                            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-left transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 hover:bg-white">
                                <div className="h-14 w-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                                    <Users className="h-7 w-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">통합 관리</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    일정, 루틴, 명언, 일기, 팀 협업까지 한 화면에서 관리할 수 있습니다. 앱을 여러 개 켜 두지 않아도 되고, 개인 생산성과 팀 협업을 하나의 흐름 안에서 함께 달성할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA: 스크롤 도착 시 작아졌다가 튀어오르는 강조 애니메이션 */}
                <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <PopInOnScroll className="mx-auto max-w-4xl text-center">
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            지금 바로 GoalDiary를 시작해보세요
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-blue-100">
                            회원가입은 1분이면 완료됩니다. 신용카드 정보도 필요하지 않습니다. 무료로 시작하고, BIG3
                            스케줄링으로 오늘의 핵심을 먼저 잡아보세요.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
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
                    </PopInOnScroll>
                </section>
            </div>
        </>
    );
}
