export type PostSchedulesType = {
    title: string;
    startDate: string;
    endDate?: string;
    teamId?: number; // 팀 일정으로 생성할 경우 팀 ID
};
export type GetSchedulesType = {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
    teamId?: number;
    team?: {
        id: number;
        name: string;
    };
};
