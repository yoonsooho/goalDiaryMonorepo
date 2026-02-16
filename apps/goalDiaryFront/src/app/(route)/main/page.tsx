"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Calendar, RotateCcw } from "lucide-react";
import CreateScheduleModal from "@/app/pageComponents/main/modal/CreateScheduleModal";
import CreateRoutineModal from "@/app/pageComponents/main/modal/CreateRoutineModal";
import { usePostSchedules } from "@/app/hooks/apiHook/useSchedules";
import { useCreateRoutine } from "@/app/hooks/apiHook/useRoutine";
import { PostSchedulesType } from "@/type/ScheduleType";
import { CreateRoutineDto } from "@/type/RoutineType";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ScheduleList from "@/app/pageComponents/main/ScheduleList";
import RoutineList from "@/app/pageComponents/main/RoutineList";
import RoutineProgressBar from "@/app/pageComponents/main/RoutineProgressBar";
import QuoteSection from "@/app/pageComponents/main/QuoteSection";
import TodaySummary from "@/app/pageComponents/main/TodaySummary";
import QuickAddSchedule from "@/app/pageComponents/main/QuickAddSchedule";

const Main = () => {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutate: postSchedules } = usePostSchedules();
    const { mutate: createRoutine } = useCreateRoutine();
    const { toast } = useToast();

    const handleCreateSchedule = async (data: PostSchedulesType) => {
        try {
            postSchedules(data, {
                onSuccess: () => {
                    setIsScheduleModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["schedules"] });
                    toast({
                        title: "일정 생성 완료",
                        description: "새로운 일정이 성공적으로 생성되었습니다.",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "일정 생성 실패",
                        description: "일정 생성 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                },
            });
        } catch (error) {
            console.error("일정 생성 에러:", error);
            throw error; // 모달에서 에러 처리할 수 있도록 re-throw
        }
    };

    const handleCreateRoutine = async (data: CreateRoutineDto) => {
        try {
            createRoutine(data, {
                onSuccess: () => {
                    setIsRoutineModalOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["routines"] });
                    toast({
                        title: "루틴 생성 완료",
                        description: "새로운 루틴이 성공적으로 생성되었습니다.",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "루틴 생성 실패",
                        description: "루틴 생성 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                },
            });
        } catch (error) {
            console.error("루틴 생성 에러:", error);
            throw error; // 모달에서 에러 처리할 수 있도록 re-throw
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="py-6">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 명언 섹션 */}
                    <QuoteSection />

                    {/* 오늘 요약 */}
                    <TodaySummary />
                </div>

                <CreateScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSubmit={handleCreateSchedule}
                />

                <CreateRoutineModal
                    isOpen={isRoutineModalOpen}
                    onClose={() => setIsRoutineModalOpen(false)}
                    onSubmit={handleCreateRoutine}
                />

                {/* 일정 / 루틴 두 칸으로 구분 */}
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* 일정 섹션 */}
                        <section className="flex flex-col" aria-labelledby="schedule-heading">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-blue-600" aria-hidden />
                                <h2 id="schedule-heading" className="text-xl font-semibold text-gray-900">
                                    일정
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">할 일을 등록하고 관리해요</p>
                            <QuickAddSchedule onOpenFullModal={() => setIsScheduleModalOpen(true)} />
                            <ScheduleList onAddClick={() => setIsScheduleModalOpen(true)} />
                        </section>

                        {/* 루틴 섹션 */}
                        <section className="flex flex-col" aria-labelledby="routine-heading">
                            <div className="flex items-center gap-2 mb-2">
                                <RotateCcw className="h-5 w-5 text-purple-600" aria-hidden />
                                <h2 id="routine-heading" className="text-xl font-semibold text-gray-900">
                                    루틴
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">매일 반복할 습관을 등록해요</p>
                            <RoutineProgressBar />
                            <Button
                                onClick={() => setIsRoutineModalOpen(true)}
                                variant="outline"
                                className="mb-4 gap-2 self-start"
                            >
                                <PlusIcon className="h-4 w-4" />새 루틴 만들기
                            </Button>
                            <RoutineList onAddClick={() => setIsRoutineModalOpen(true)} />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Main;
