export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface SharedRoutine {
    id: number;
    title: string;
    description?: string;
    schedule_date?: string; // YYYY-MM-DD
    time?: string;
    duration?: number;
    isActive: boolean;
    category?: string[];
    streak: number;
    last_completed_date?: string;
    created_at: Date | string; // 프론트는 string으로 받을 수 있음
    updated_at: Date | string;
}

export interface SharedCreateRoutineDto {
    title: string;
    description?: string;
    schedule_date?: string;
    time?: string;
    duration?: number;
    isActive?: boolean;
    category?: string[];
}
