import { boards } from "@/type/boards";
// 보드나 아이템의 위치를 찾는 헬퍼 함수들
export const helpers = (items: boards) => ({
    isSomeBoard: (id: number) => items.some((board) => board.id === id),
    findBoardIdx: (itemId: number) => items.findIndex((board) => board.contentItems.some((item) => item.id === itemId)),
    findBoard: (itemId: number) => items.find((board) => board.contentItems.some((item) => item.id === itemId)),
    getBoardItems: (boardIndex: number) => items[boardIndex]?.contentItems || [],
});
