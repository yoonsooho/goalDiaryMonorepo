"use client";
import React, { useState } from "react";
import { PageLoading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Calendar,
    Play,
    Edit,
    Trash2,
    CheckCircle,
    RotateCcw,
    Power,
    PowerOff,
    Flame,
    Loader2,
    Plus,
} from "lucide-react";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import UpdateRoutineModal from "@/app/pageComponents/main/modal/UpdateRoutineModal";
import {
    useGetRoutines,
    useDeleteRoutine,
    useCompleteRoutine,
    useUncompleteRoutine,
    useUpdateRoutine,
} from "@/app/hooks/apiHook/useRoutine";
import { RoutineType, CreateRoutineDto } from "@/type/RoutineType";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

type RoutineListProps = {
    onAddClick?: () => void;
};

const RoutineList = ({ onAddClick }: RoutineListProps) => {
    const { data: routines, isLoading, error } = useGetRoutines();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<RoutineType | null>(null);

    const { openConfirm, ConfirmModal } = useConfirmModal();

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { mutate: deleteRoutine } = useDeleteRoutine();
    const { mutate: completeRoutine } = useCompleteRoutine();
    const { mutate: uncompleteRoutine } = useUncompleteRoutine();
    const { mutate: updateRoutine } = useUpdateRoutine();

    const isUncompleteMutating =
        useIsMutating({
            mutationKey: ["uncompleteRoutine"],
        }) > 0;
    const isCompleteMutating =
        useIsMutating({
            mutationKey: ["completeRoutine"],
        }) > 0;
    const isUpdateMutating =
        useIsMutating({
            mutationKey: ["updateRoutine"],
        }) > 0;
    const isDeleteMutating =
        useIsMutating({
            mutationKey: ["deleteRoutine"],
        }) > 0;

    const isMutating = isUncompleteMutating || isCompleteMutating || isUpdateMutating || isDeleteMutating;

    const handleDeleteRoutine = (id: number) => {
        deleteRoutine(id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["routines"] });
                toast({
                    title: "루틴 삭제 완료",
                    description: "루틴이 성공적으로 삭제되었습니다.",
                });
            },
            onError: (error) => {
                toast({
                    title: "루틴 삭제 실패",
                    description: "루틴 삭제 중 오류가 발생했습니다.",
                    variant: "destructive",
                });
            },
        });
    };

    const handleCompleteRoutine = (id: number, date: string) => {
        completeRoutine(
            { id, local_date: date },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["routines"] });
                    queryClient.invalidateQueries({ queryKey: ["routines", "today"] });
                    toast({
                        title: "루틴 완료",
                        description: "루틴을 완료했습니다!",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "루틴 완료 실패",
                        description: error.message,
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleUncompleteRoutine = (id: number, date: string) => {
        uncompleteRoutine(
            { id, local_date: date },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["routines"] });
                    queryClient.invalidateQueries({ queryKey: ["routines", "today"] });
                    toast({
                        title: "완료 취소",
                        description: "루틴 완료를 취소했습니다.",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "완료 취소 실패",
                        description: "루틴 완료 취소 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleToggleActive = (routine: RoutineType) => {
        updateRoutine(
            { id: routine.id, data: { isActive: !routine.isActive } },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["routines"] });
                    toast({
                        title: routine.isActive ? "루틴 비활성화" : "루틴 활성화",
                        description: routine.isActive ? "루틴이 비활성화되었습니다." : "루틴이 활성화되었습니다.",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "상태 변경 실패",
                        description: "루틴 상태 변경 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleEditRoutine = (routine: RoutineType) => {
        setSelectedRoutine(routine);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateRoutine = async (data: Partial<CreateRoutineDto>) => {
        if (!selectedRoutine) return;

        updateRoutine(
            { id: selectedRoutine.id, data },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["routines"] });
                    toast({
                        title: "루틴 수정 완료",
                        description: "루틴이 성공적으로 수정되었습니다.",
                    });
                },
                onError: (error) => {
                    toast({
                        title: "루틴 수정 실패",
                        description: error.message,
                        variant: "destructive",
                    });
                },
            }
        );
    };

    if (isLoading) {
        return <PageLoading text="루틴을 로딩중입니다..." />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <RotateCcw className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">루틴을 불러올 수 없습니다</h3>
                    <p className="text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
                </div>
            </div>
        );
    }

    if (!routines || routines.length === 0) {
        return (
            <>
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                    <div className="text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                            <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            아직 등록된 루틴이 없어요
                        </h3>
                        <p className="text-gray-500 mb-6 text-sm sm:text-base">
                            새로운 루틴을 만들어 일상을 체계적으로 관리해보세요!
                        </p>
                        {onAddClick ? (
                            <Button onClick={onAddClick} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                <Plus className="h-4 w-4" />첫 루틴 만들기
                            </Button>
                        ) : (
                            <p className="text-sm text-gray-500">위의 &quot;새 루틴 만들기&quot; 버튼을 클릭하세요</p>
                        )}
                    </div>
                </div>
                <ConfirmModal />
            </>
        );
    }

    // 루틴을 활성 상태에 따라 정렬 (활성 루틴이 먼저, 비활성 루틴이 나중에)
    const sortedRoutines =
        routines?.sort((a: RoutineType, b: RoutineType) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return 0;
        }) || [];

    return (
        <>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-2 [@media(min-width:1600px)]:grid-cols-3">
                {sortedRoutines.map((routine: RoutineType) => (
                    <Card
                        key={routine.id}
                        className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                            routine.isActive
                                ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm"
                                : "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-75"
                        }`}
                    >
                        <CardHeader className="pb-3 sm:pb-4 w-full p-4 sm:p-6">
                            <div className="flex items-start justify-between w-full gap-2 sm:gap-0">
                                <div className="flex-1 w-full min-w-0">
                                    <CardTitle
                                        className={`text-base sm:text-lg font-semibold mb-2 break-words leading-tight whitespace-pre-wrap ${
                                            routine.isActive ? "text-gray-900" : "text-gray-500"
                                        }`}
                                    >
                                        {routine.title}
                                    </CardTitle>
                                    {routine.description && (
                                        <p
                                            className={`text-xs sm:text-sm leading-relaxed break-words flex-1 mb-2 sm:mb-3 ${
                                                routine.isActive ? "text-gray-600" : "text-gray-400"
                                            }`}
                                        >
                                            {routine.description}
                                        </p>
                                    )}
                                    {routine.streak !== undefined &&
                                        routine.streak > 0 &&
                                        routine.last_completed_date === dayjs().format("YYYY-MM-DD") && (
                                            <div
                                                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 mb-2 sm:mb-3 ${
                                                    routine.isActive
                                                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                                                        : "bg-gray-100 text-gray-500 border border-gray-200"
                                                }`}
                                            >
                                                <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                <span>{routine.streak}일</span>
                                            </div>
                                        )}
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        {routine.category && routine.category.length > 0 && (
                                            <>
                                                {routine.category.map((cat, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant={routine.isActive ? "default" : "secondary"}
                                                        className="break-words text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-pre-wrap"
                                                    >
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                        onClick={() => handleEditRoutine(routine)}
                                    >
                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700"
                                        onClick={() =>
                                            openConfirm(() => handleDeleteRoutine(routine.id), {
                                                title: "루틴 삭제",
                                                description: `"${routine.title}" 루틴을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
                                                confirmText: "삭제",
                                                cancelText: "취소",
                                                variant: "destructive",
                                            })
                                        }
                                    >
                                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <div className="space-y-3 sm:space-y-4">
                                {/* 시간 정보 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {routine.time && (
                                        <div
                                            className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                                                routine.isActive ? "text-gray-600" : "text-gray-400"
                                            }`}
                                        >
                                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate whitespace-pre-wrap">{routine.time}</span>
                                        </div>
                                    )}
                                    {routine.duration && (
                                        <div
                                            className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                                                routine.isActive ? "text-gray-600" : "text-gray-400"
                                            }`}
                                        >
                                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate whitespace-pre-wrap">{routine.duration}분</span>
                                        </div>
                                    )}
                                </div>

                                {/* 루틴 상태 및 예정일 */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleToggleActive(routine)}
                                        className={`flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-full transition-all cursor-pointer border font-medium whitespace-nowrap ${
                                            routine.isActive
                                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
                                                : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300"
                                        }`}
                                    >
                                        {routine.isActive ? (
                                            <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        ) : (
                                            <PowerOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        )}
                                        {routine.isActive ? "활성" : "비활성"}
                                    </button>
                                    {routine.schedule_date && (
                                        <div
                                            className={`flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 py-1 rounded-md ${
                                                routine.isActive
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-gray-50 text-gray-500"
                                            }`}
                                        >
                                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span className="font-medium whitespace-nowrap">
                                                {routine.schedule_date}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex gap-2 pt-1">
                                    {(() => {
                                        const today = dayjs().format("YYYY-MM-DD");
                                        const isCompletedToday = routine.last_completed_date === today;

                                        return isCompletedToday ? (
                                            <Button
                                                size="sm"
                                                className={`flex-1 h-9 sm:h-10 font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                                                    routine.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                }`}
                                                onClick={() =>
                                                    routine.isActive && handleUncompleteRoutine(routine.id, today)
                                                }
                                                disabled={!routine.isActive || isMutating}
                                            >
                                                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                                {isMutating ? (
                                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                                                ) : (
                                                    "완료"
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className={`flex-1 h-9 sm:h-10 font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                                                    routine.isActive
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                                onClick={() =>
                                                    routine.isActive && handleCompleteRoutine(routine.id, today)
                                                }
                                                disabled={!routine.isActive || isMutating}
                                            >
                                                {isMutating ? (
                                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                                                ) : (
                                                    "미완료"
                                                )}
                                            </Button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <ConfirmModal />

            <UpdateRoutineModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateRoutine}
                routine={selectedRoutine}
            />
        </>
    );
};

export default RoutineList;
