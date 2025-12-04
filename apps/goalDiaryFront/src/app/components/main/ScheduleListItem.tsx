import { GetSchedulesType, PostSchedulesType } from "@/type/ScheduleType";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import { Trash } from "lucide-react";
import { ConfirmModalProps, useConfirmModal } from "@/components/ui/confirm-modal";
import { useDeleteSchedules, useUpdateSchedules } from "@/app/hooks/apiHook/useSchedules";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import UpdateScheduleModal from "@/app/components/main/modal/UpdateScheduleModal";

const ScheduleListItem = ({
    schedule,
    openConfirm,
}: {
    schedule: GetSchedulesType;
    openConfirm: (
        action: () => void,
        props?: Partial<Pick<ConfirmModalProps, "title" | "description" | "confirmText" | "cancelText" | "variant">>
    ) => void;
}) => {
    const queryClient = useQueryClient();
    const { mutate: deleteSchedules } = useDeleteSchedules();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: updateSchedules } = useUpdateSchedules();
    const handleDeleteSchedule = (id: string) => {
        deleteSchedules(id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["schedules"] });
                toast({
                    title: "일정 삭제 완료",
                    description: "일정 삭제 완료",
                    variant: "destructive",
                });
            },
            onError: (error) => {
                toast({
                    title: "일정 삭제 실패",
                    description: error.message,
                    variant: "destructive",
                });
            },
        });
    };
    const handleUpdateSchedule = (data: PostSchedulesType) => {
        updateSchedules(
            { ...data, id: schedule.id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["schedules"] });
                    toast({
                        title: "일정 수정 완료",
                        description: "일정 수정 완료",
                        variant: "default",
                    });
                    setIsModalOpen(false);
                },
                onError: (error) => {
                    toast({
                        title: "일정 수정 실패",
                        description: error.message,
                        variant: "destructive",
                    });
                },
            }
        );
    };
    return (
        <>
            <UpdateScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={async (data: PostSchedulesType) => await handleUpdateSchedule(data)}
                defaultValues={{
                    title: schedule.title,
                    startDate: schedule.startDate,
                    endDate: schedule.endDate,
                }}
            />
            <Link
                href={`main/schedules/${schedule.id}`}
                key={`${schedule.title}-${schedule.startDate}`}
                className="block group"
            >
                <div className="relative overflow-hidden border border-gray-200/60 p-6 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex justify-between items-center bg-white/80 backdrop-blur-sm">
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-3">
                            {schedule.title}
                        </h1>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-700">시작일</span>
                                <span className="text-sm text-blue-600 font-semibold">{schedule.startDate}</span>
                            </div>
                            {schedule.endDate && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-700">종료일</span>
                                    <span className="text-sm text-green-600 font-semibold">{schedule.endDate}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsModalOpen(true);
                            }}
                            className="hover:bg-blue-100 hover:text-blue-600 rounded-full p-2"
                        >
                            <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openConfirm(() => handleDeleteSchedule(schedule.id), {
                                    title: "일정 삭제",
                                    description: `"${schedule.title}" 일정을 정말 삭제하시겠습니까?`,
                                    confirmText: "삭제",
                                    cancelText: "취소",
                                    variant: "destructive",
                                });
                            }}
                            className="hover:bg-red-100 hover:text-red-600 rounded-full p-2"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default ScheduleListItem;
