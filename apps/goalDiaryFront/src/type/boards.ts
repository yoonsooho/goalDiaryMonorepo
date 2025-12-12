export type board = {
    id: number;
    title: string;
    seq: number;
    contentItems: contentItem[];
};
export type contentItem = {
    id: number;
    text: string;
    startTime: string | null;
    endTime: string | null;
    isCompleted: boolean;
};

export type boards = board[];
