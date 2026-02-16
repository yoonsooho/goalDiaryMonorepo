"use client";
import { useGetSchedules } from "@/app/hooks/apiHook/useSchedules";
import { GetSchedulesType } from "@/type/ScheduleType";
import React from "react";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { PageLoading } from "@/components/ui/loading";
import ScheduleListItem from "@/app/pageComponents/main/ScheduleListItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ScheduleListProps = {
    onAddClick?: () => void;
};

const ScheduleList = ({ onAddClick }: ScheduleListProps) => {
    const { data: schedules, isLoading } = useGetSchedules();
    const { openConfirm, ConfirmModal } = useConfirmModal();

    return (
        <div className="w-full flex flex-col gap-4">
            <ConfirmModal />
            {isLoading ? (
                <PageLoading text="일정을 로딩중입니다..." />
            ) : schedules && schedules.length > 0 ? (
                schedules.map((schedule: GetSchedulesType) => (
                    <ScheduleListItem key={schedule.id} schedule={schedule} openConfirm={openConfirm} />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                    <div className="text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            아직 등록된 일정이 없어요
                        </h3>
                        <p className="text-gray-500 mb-6 text-sm sm:text-base">첫 일정을 만들어 보세요!</p>
                        {onAddClick ? (
                            <Button onClick={onAddClick} className="gap-2">
                                <Plus className="h-4 w-4" />첫 일정 만들기
                            </Button>
                        ) : (
                            <p className="text-sm text-gray-500">위의 &quot;새 일정 만들기&quot; 버튼을 클릭하세요</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleList;
