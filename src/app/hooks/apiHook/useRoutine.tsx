import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getRoutines,
    createRoutine,
    getRoutine,
    updateRoutine,
    deleteRoutine,
    getTodayRoutines,
    completeRoutine,
    uncompleteRoutine,
    getRoutineStats,
    getRoutineStreak,
} from "@/api/routineApi";
import { CreateRoutineDto, RoutineType } from "@/type/RoutineType";

// 사용자의 모든 루틴 조회
export const useGetRoutines = () => {
    return useQuery({
        queryKey: ["routines"],
        queryFn: getRoutines,
    });
};

// 특정 루틴 조회
export const useGetRoutine = (id: number) => {
    return useQuery({
        queryKey: ["routine", id],
        queryFn: () => getRoutine(id),
        enabled: !!id,
    });
};

// 새 루틴 생성
export const useCreateRoutine = () => {
    return useMutation({
        mutationKey: ["createRoutine"],
        mutationFn: (data: CreateRoutineDto) => {
            return createRoutine(data);
        },
    });
};

// 루틴 수정
export const useUpdateRoutine = () => {
    return useMutation({
        mutationKey: ["updateRoutine"],
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateRoutineDto> }) => {
            return updateRoutine(id, data);
        },
    });
};

// 루틴 삭제
export const useDeleteRoutine = () => {
    return useMutation({
        mutationKey: ["deleteRoutine"],
        mutationFn: (id: number) => {
            return deleteRoutine(id);
        },
    });
};

// 오늘의 루틴 완료 상태 조회
export const useGetTodayRoutines = ({ local_date }: { local_date: string }) => {
    return useQuery({
        queryKey: ["routines", "today"],
        queryFn: () => getTodayRoutines({ local_date }),
        enabled: !!local_date,
    });
};

// 루틴 완료 처리
export const useCompleteRoutine = () => {
    return useMutation({
        mutationKey: ["completeRoutine"],
        mutationFn: ({ id, local_date }: { id: number; local_date: string }) => {
            return completeRoutine(id, local_date);
        },
    });
};

// 루틴 완료 취소
export const useUncompleteRoutine = () => {
    return useMutation({
        mutationKey: ["uncompleteRoutine"],
        mutationFn: ({ id, local_date }: { id: number; local_date: string }) => {
            return uncompleteRoutine(id, local_date);
        },
    });
};

// 루틴 통계 조회
export const useGetRoutineStats = () => {
    return useQuery({
        queryKey: ["routines", "stats"],
        queryFn: getRoutineStats,
    });
};

// 특정 루틴의 연속 달성 일수
export const useGetRoutineStreak = (id: number) => {
    return useQuery({
        queryKey: ["routine", id, "streak"],
        queryFn: () => getRoutineStreak(id),
        enabled: !!id,
    });
};
