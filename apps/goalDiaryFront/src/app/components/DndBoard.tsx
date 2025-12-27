"use client";

import useBoardHandler from "@/app/hooks/useBoardHandler";
import { SortableItem } from "./SortableItem";
import useDndHandlers from "@/app/hooks/useDndHandlers";
import useItemHandler from "@/app/hooks/useItemHandler";
import { helpers } from "@/app/lib/helpers";
import { boards } from "@/type/boards";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { Board } from "./Board";
import { useGetPosts } from "@/app/hooks/apiHook/usePost";
import { PageLoading } from "@/components/ui/loading";

import { useMutationState } from "@tanstack/react-query";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import BigCalendar, { CalendarEvent } from "@/components/calendar/BigCalendar";
import dayjs from "dayjs";
import { useScheduleWebSocket } from "@/app/hooks/useScheduleWebSocket";

import { useSearchParams } from "next/navigation";

export default function DndBoard({ scheduleId }: { scheduleId: number }) {
    // WebSocket 연결 (팀 일정인 경우 실시간 동기화)
    const searchParams = useSearchParams();
    const isTeam = searchParams.get("isTeam") === "true";

    useScheduleWebSocket(scheduleId, { enabled: isTeam });
    const { data: boardsData } = useGetPosts(scheduleId);
    // 하이드레이션된 데이터를 초기값으로 사용 (첫 렌더링부터 데이터가 있도록)
    const [boards, setBoards] = useState<boards>(() => boardsData || []);
    const [activeId, setActiveId] = useState<number | null>(null); //items와 activeId둘다 변경될때 실행 따라서 두개의 아이디를 공용해서 사용하는 state

    const [firstActiveBoardId, setFirstActiveBoardId] = useState<number | null>(null);
    const helper = helpers(boards);
    const { handleDragStart, handleDragEnd, handleDragOver } = useDndHandlers(
        boards,
        setBoards,
        setActiveId,
        helper,
        scheduleId,
        firstActiveBoardId
    );
    const { handleAddItem, handleEditItem, handleDeleteItem } = useItemHandler(setBoards);
    const { handleAddBoard, handleEditBoard, handleDeleteBoard } = useBoardHandler(setBoards, scheduleId);
    // 센서 설정
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const postsPending = useMutationState({
        filters: { status: "pending", mutationKey: ["posts"] },
    });
    const contentItemsPending = useMutationState({
        filters: { status: "pending", mutationKey: ["contentItems"] },
    });

    // React Query 데이터가 업데이트되면 동기화
    useLayoutEffect(() => {
        if (boardsData) {
            setBoards(boardsData);
        }
    }, [boardsData]);

    const isMutating = postsPending.length > 0 || contentItemsPending.length > 0;

    const anotherContentTimeLists = useMemo(
        () => (boards: boards) => (excludeContentId: number) => {
            return boards
                .flatMap((board) => board.contentItems.filter((item) => item.id !== excludeContentId))
                .map((item) => ({
                    id: item.id,
                    startTime: item.startTime,
                    endTime: item.endTime,
                }));
        },
        [boards]
    );

    return (
        <div className="p-8 box-border flex flex-row gap-4" suppressHydrationWarning>
            <LoadingOverlay open={isMutating} text="업데이트 중입니다..." />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={(e) => {
                    handleDragStart(e);
                    const boardId = boards.find((board) =>
                        board.contentItems.some((item) => item.id === e.active.id)
                    )?.id;
                    setFirstActiveBoardId(boardId || null);
                }}
                onDragOver={handleDragOver}
                onDragEnd={(e) => {
                    handleDragEnd(e);
                    setFirstActiveBoardId(null);
                }}
            >
                <SortableContext items={boards.map((board) => board.id)}>
                    <div className="flex flex-col gap-4 flex-[0.4]">
                        {boards?.map((board) => (
                            <Board
                                key={board.id}
                                id={board.id}
                                title={board.title}
                                items={board.contentItems}
                                handleEditBoard={handleEditBoard}
                                handleDeleteBoard={handleDeleteBoard}
                                handleEditItem={handleEditItem}
                                handleDeleteItem={handleDeleteItem}
                                handleAddItem={handleAddItem}
                                anotherContentTimeLists={anotherContentTimeLists(boards)}
                            />
                        ))}
                        {/* 보드 추가 기능 추가 추후 재사용할 수도 있음 */}
                        {/* <div className="w-96 p-4 bg-gray-100 rounded-lg min-h-[200px] relative flex flex-col">
                            <h2 className="mb-6 text-lg font-bold text-gray-700">Add board</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!newBoard.trim()) return; // 빈 문자열 체크
                                    handleAddBoard(newBoard);
                                    setNewBoard("");
                                }}
                                className="flex flex-col gap-2"
                            >
                                <input
                                    type="text"
                                    value={newBoard}
                                    onChange={(e) => setNewBoard(e.target.value)}
                                    placeholder="보드 이름을 적어주세요."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newBoard.trim()}
                                    className="w-full px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add board
                                </button>
                            </form>
                        </div> */}
                    </div>
                </SortableContext>
                <div className="h-full mt-2 flex-[0.6]">
                    <BigCalendar
                        events={boards.flatMap((board) =>
                            board.contentItems.reduce<CalendarEvent[]>(
                                (
                                    acc: CalendarEvent[],
                                    cur: {
                                        id: number;
                                        text: string;
                                        startTime: string | null;
                                        endTime: string | null;
                                    }
                                ) => {
                                    if (cur?.startTime && cur?.endTime) {
                                        let startTime = new Date(
                                            dayjs(`${dayjs().format("YYYY-MM-DD")} ${cur.startTime}`).format(
                                                "YYYY-MM-DD HH:mm"
                                            )
                                        );
                                        let endTime = new Date(
                                            dayjs(`${dayjs().format("YYYY-MM-DD")} ${cur.endTime}`).format(
                                                "YYYY-MM-DD HH:mm"
                                            )
                                        );
                                        acc.push({
                                            id: cur.id,
                                            title: cur.text,
                                            startTime: startTime,
                                            endTime: endTime,
                                        });
                                    }
                                    return acc;
                                },
                                []
                            )
                        )}
                        defaultDate={new Date()}
                    />
                </div>
                {/* dnd 오버레이(dnd 애니메이션 효과) */}
                <DragOverlay>
                    {activeId &&
                        (helper.isSomeBoard(activeId) ? (
                            <Board
                                id={Number(activeId)}
                                title={boards.find((c) => c.id === activeId)?.title || ""}
                                items={boards.find((c) => c.id === activeId)?.contentItems || []}
                                isDragOverlay
                            />
                        ) : (
                            <SortableItem
                                id={Number(activeId)}
                                name={
                                    boards.flatMap((c) => c.contentItems).find((item) => item.id === Number(activeId))
                                        ?.text || ""
                                }
                                isDragOverlay
                            />
                        ))}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
