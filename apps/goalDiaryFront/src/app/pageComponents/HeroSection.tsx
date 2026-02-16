"use client";

import { Target, Zap } from "lucide-react";
import ClientAuthPage from "./ClientAuthPage";

/**
 * 메인 히어로 + 로그인 영역. hknewflow.com 스타일 인터랙션:
 * - 스태거드 fade-in-up 등장 애니메이션
 * - 로그인 카드는 글래스모피즘 + 부드러운 등장
 */
export default function HeroSection() {
    return (
        <section className="px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left: 왼쪽 → 오른쪽 스르륵 등장 */}
                    <div className="flex flex-col justify-center">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 w-fit opacity-40 -translate-x-20 animate-slide-in-from-left"
                            style={{ animationDelay: "0ms" }}
                        >
                            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>BIG3 우선순위 스케줄링</span>
                        </div>
                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 opacity-40 -translate-x-20 animate-slide-in-from-left"
                            style={{ animationDelay: "100ms" }}
                        >
                            <span className="text-blue-600">오늘의 핵심 3가지</span>
                            <br />
                            먼저 시간에 배치하기
                        </h1>
                        <p
                            className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl leading-7 sm:leading-8 text-gray-600 opacity-40 -translate-x-20 animate-slide-in-from-left"
                            style={{ animationDelay: "200ms" }}
                        >
                            일반 Todo처럼 체크만 하는 게 아니라,{" "}
                            <strong className="text-gray-900">BIG1/BIG2/BIG3를 먼저 고르고</strong> → 그걸 우선으로 시간
                            배정 → 나머지 작업을 주변에 배치하는{" "}
                            <strong className="text-gray-900">혁신적인 일정 관리 방식</strong>입니다.
                        </p>

                        <div
                            className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-lg opacity-40 -translate-x-20 animate-slide-in-from-left"
                            style={{ animationDelay: "280ms" }}
                        >
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                                        기존 일정 앱과의 차이점
                                    </h3>
                                    <p className="mt-1 sm:mt-2 text-gray-600 text-xs sm:text-sm">
                                        하루에 해야 할 일이 많을 때, 무엇이 진짜 중요한지 한눈에 안 보였나요?
                                        GoalDiary는{" "}
                                        <strong>오늘 꼭 지켜야 할 핵심 3가지(BIG3)를 먼저 시간에 고정</strong> 하고
                                        나머지를 설계하는 일정 도구입니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: 오른쪽 → 왼쪽 스르륵 등장 (#login 앵커 대상) */}
                    <div
                        id="login"
                        className="flex items-center justify-center opacity-40 translate-x-20 animate-slide-in-from-right"
                        style={{ animationDelay: "150ms" }}
                    >
                        <div className="w-full max-w-md [--auth-card-bg:rgba(255,255,255,0.85)] dark:[--auth-card-bg:rgba(15,23,42,0.85)]">
                            <div className="rounded-2xl border border-white/40 bg-[var(--auth-card-bg)] shadow-xl shadow-blue-900/5 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-0.5">
                                <ClientAuthPage />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
