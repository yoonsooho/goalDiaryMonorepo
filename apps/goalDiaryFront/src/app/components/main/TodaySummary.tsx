"use client";

import React from "react";
import { Calendar, ListTodo } from "lucide-react";
import { useGetSchedules } from "@/app/hooks/apiHook/useSchedules";
import { useGetTodayRoutines } from "@/app/hooks/apiHook/useRoutine";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

export default function TodaySummary() {
    const today = dayjs().format("YYYY-MM-DD");
    const { data: schedules, isLoading: schedulesLoading } = useGetSchedules();
    const { data: todayData, isLoading: routineLoading } = useGetTodayRoutines({
        local_date: today,
    });

    const scheduleCount = schedules?.length ?? 0;
    const progress = todayData?.progress;
    const routineText =
        progress && progress.totalRoutines > 0
            ? `${progress.completedRoutines}/${progress.totalRoutines} 완료`
            : "0개";

    if (schedulesLoading && routineLoading) return null;

    return (
        <section
            className="mb-4 sm:mb-6 rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-5"
            aria-label="오늘 요약"
        >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
                <span className="font-semibold text-gray-900">
                    오늘 · {dayjs().format("YYYY년 M월 D일 (ddd)")}
                </span>
                <span className="text-gray-400">|</span>
                <span className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-4 w-4 text-blue-500" aria-hidden />
                    일정 {scheduleCount}개
                </span>
                <span className="text-gray-400">|</span>
                <span className="flex items-center gap-1.5 text-gray-600">
                    <ListTodo className="h-4 w-4 text-purple-500" aria-hidden />
                    루틴 {routineText}
                </span>
            </div>
        </section>
    );
}
