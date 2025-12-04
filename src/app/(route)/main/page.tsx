"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Calendar, RotateCcw } from "lucide-react";
import CreateScheduleModal from "@/app/components/main/modal/CreateScheduleModal";
import CreateRoutineModal from "@/app/components/main/modal/CreateRoutineModal";
import { usePostSchedules } from "@/app/hooks/apiHook/useSchedules";
import { useCreateRoutine } from "@/app/hooks/apiHook/useRoutine";
import { PostSchedulesType } from "@/type/ScheduleType";
import { CreateRoutineDto } from "@/type/RoutineType";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ScheduleList from "@/app/components/main/ScheduleList";
import RoutineList from "@/app/components/main/RoutineList";
import RoutineProgressBar from "@/app/components/main/RoutineProgressBar";

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
                    {/* 액션 버튼들 */}
                    <div className="mb-6 flex gap-3">
                        <Button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2">
                            <PlusIcon className="h-4 w-4" />새 일정 만들기
                        </Button>
                        <Button
                            onClick={() => setIsRoutineModalOpen(true)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />새 루틴 만들기
                        </Button>
                    </div>
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

                {/* 콘텐츠 영역 - 두 섹션을 나란히 배치 */}
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* 일정 섹션 */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">일정</h2>
                            </div>
                            <ScheduleList />
                        </div>

                        {/* 루틴 섹션 */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <RotateCcw className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900">루틴</h2>
                            </div>

                            {/* 루틴 완료율 프로그레스 바 */}
                            <RoutineProgressBar />

                            <RoutineList />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Main;
