import { board } from "@/type/boards";

export interface DndHelpers {
    isSomeBoard: (id: number) => boolean;
    findBoardIdx: (itemId: number) => number;
    findBoard: (itemId: number) => board | undefined;
    getBoardItems: (
        boardIndex: number
    ) => { id: number; text: string; startTime: string | null; endTime: string | null }[];
}
