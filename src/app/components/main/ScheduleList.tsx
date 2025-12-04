"use client";
import { useGetSchedules } from "@/app/hooks/apiHook/useSchedules";
import { GetSchedulesType } from "@/type/ScheduleType";
import React from "react";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { PageLoading } from "@/components/ui/loading";
import ScheduleListItem from "@/app/components/main/ScheduleListItem";

const ScheduleList = () => {
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
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-blue-500"
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 등록된 일정이 없어요</h3>
                        <p className="text-gray-500 mb-6">새로운 일정을 등록해보세요!</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            위의 &quot;새 일정 만들기&quot; 버튼을 클릭하세요
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleList;
