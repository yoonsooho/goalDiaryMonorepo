export type CreateRoutineDto = {
    title: string;
    description?: string;
    schedule_date?: string; // YYYY-MM-DD 형식
    time?: string;
    duration?: number;
    isActive?: boolean;
    category?: string[];
};

export type RoutineType = {
    id: number;
    title: string;
    description?: string;
    schedule_date?: string;
    time?: string;
    duration?: number;
    isActive?: boolean;
    category?: string[];
    created_at?: string;
    updated_at?: string;
    streak?: number;
    last_completed_date?: string;
};
