import { commonApi, commonApiJson } from "@/api/commonApi";
import { CreateRoutineDto, RoutineType } from "@/type/RoutineType";

// 사용자의 모든 루틴 조회
export const getRoutines = async () => {
    return await commonApiJson("/api/routines", {
        method: "GET",
        requireAuth: true,
    });
};

// 새 루틴 생성
export const createRoutine = async (data: CreateRoutineDto) => {
    return await commonApiJson("/api/routines", {
        method: "POST",
        body: data,
        requireAuth: true,
    });
};

// 특정 루틴 조회
export const getRoutine = async (id: number) => {
    return await commonApiJson(`/api/routines/${id}`, {
        method: "GET",
        requireAuth: true,
    });
};

// 루틴 수정
export const updateRoutine = async (id: number, data: Partial<CreateRoutineDto>) => {
    return await commonApiJson(`/api/routines/${id}`, {
        method: "PATCH",
        body: data,
        requireAuth: true,
    });
};

// 루틴 삭제
export const deleteRoutine = async (id: number) => {
    const response = await commonApi(`/api/routines/${id}`, {
        method: "DELETE",
        requireAuth: true,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
    }

    // 텍스트 응답 처리
    const text = await response.text();
    return { message: text };
};

// 오늘의 루틴 완료 상태 조회
export const getTodayRoutines = async ({ local_date }: { local_date: string }) => {
    return await commonApiJson(`/api/routines/today?local_date=${local_date}`, {
        method: "GET",
        requireAuth: true,
    });
};

// 루틴 완료 처리
export const completeRoutine = async (id: number, local_date?: string) => {
    return await commonApiJson(`/api/routines/${id}/complete`, {
        method: "POST",
        body: { local_date },
        requireAuth: true,
    });
};

// 루틴 완료 취소
export const uncompleteRoutine = async (id: number, local_date?: string) => {
    const response = await commonApi(`/api/routines/${id}/complete`, {
        method: "DELETE",
        body: { local_date },
        requireAuth: true,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).response = response;
        throw error;
    }

    // 텍스트 응답 처리
    const text = await response.text();
    return { message: text };
};

// 루틴 통계 조회
export const getRoutineStats = async () => {
    return await commonApiJson("/api/routines/stats", {
        method: "GET",
        requireAuth: true,
    });
};

// 특정 루틴의 연속 달성 일수
export const getRoutineStreak = async (id: number) => {
    return await commonApiJson(`/api/routines/${id}/streak`, {
        method: "GET",
        requireAuth: true,
    });
};
