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
    // 드래그 앤 드롭/정렬을 위한 순서 정보 (백엔드의 seq)
    seq?: number;
    isCompleted: boolean;
    // BIG1, BIG2, BIG3 우선순위 (1,2,3). 없으면 null/undefined
    bigRank?: number | null;
};

export type boards = board[];
