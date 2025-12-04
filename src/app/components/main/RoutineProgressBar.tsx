"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Target } from "lucide-react";
import { useGetRoutines, useGetTodayRoutines } from "@/app/hooks/apiHook/useRoutine";
import { PageLoading } from "@/components/ui/loading";
import dayjs from "dayjs";

const RoutineProgressBar = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const { data: todayRoutinesData, isLoading: todayLoading } = useGetTodayRoutines({ local_date: today });
    const todayRoutines = todayRoutinesData?.routines;
    const todayRoutinesProgress = todayRoutinesData?.progress;

    if (todayLoading) {
        return <PageLoading text="루틴 진행률을 로딩중입니다..." />;
    }

    const totalRoutines = todayRoutinesProgress.totalRoutines || 0;
    const completedRoutines = todayRoutinesProgress.completedRoutines || 0;
    const completionRate = todayRoutinesProgress.completionRate > 0 ? todayRoutinesProgress.completionRate : 0;

    return (
        <Card className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">오늘의 루틴</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-900">
                            {completedRoutines}/{totalRoutines}
                        </span>
                    </div>
                </div>

                {/* 프로그레스 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-width duration-500 ease-out"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>

                {/* 완료율 텍스트 */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                        {completionRate === 100 ? "🎉 모든 루틴 완료!" : `${Math.round(completionRate)}% 완료`}
                    </span>
                    {completionRate > 0 && completionRate < 100 && (
                        <span className="text-xs text-purple-600 font-medium">
                            {totalRoutines - completedRoutines}개 남음
                        </span>
                    )}
                </div>

                {/* 완료된 루틴 목록 (작은 화면에서는 숨김) */}
                {completedRoutines > 0 && todayRoutines && (
                    <div className="mt-3 pt-3 border-t border-purple-100">
                        <div className="flex flex-wrap gap-1">
                            {todayRoutines.map((routine: any) => (
                                <span
                                    key={routine.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                >
                                    <CheckCircle className="h-3 w-3" />
                                    {routine.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RoutineProgressBar;
