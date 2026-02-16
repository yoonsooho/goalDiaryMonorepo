export type DiaryFormData = {
    id: number;
    date: string;
    time: string;
    content: string;
};
export type DiaryTimeFormData = Omit<DiaryFormData, "id">;
