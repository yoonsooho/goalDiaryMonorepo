/**
 * DndBoard 컴포넌트
 *
 * 일정 상세 페이지의 메인 레이아웃 컴포넌트입니다.
 *
 * 주요 기능:
 * - 좌측: 할 일 보드 영역 (여러 보드와 각 보드의 할 일 카드들을 드래그 앤 드롭으로 관리)
 * - 우측: 오늘 스케줄 타임라인 (시간 정보가 있는 카드들을 시간순으로 정렬하여 표시)
 *
 * 기능:
 * - 보드/카드 드래그 앤 드롭으로 순서 변경
 * - 오늘 스케줄에서 완료 상태 토글
 * - WebSocket을 통한 팀 일정 실시간 동기화 (팀 일정인 경우)
 * - BIG1/BIG2/BIG3 랭크 표시
 */

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
import { useLayoutEffect, useMemo, useState } from "react";

import { Board } from "./Board";
import { useGetPosts } from "@/app/hooks/apiHook/usePost";
import { useMutationState, useQueryClient } from "@tanstack/react-query";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import dayjs from "dayjs";
import { useScheduleWebSocket } from "@/app/hooks/useScheduleWebSocket";
import { usePatchContentItems } from "@/app/hooks/apiHook/useContentItem";
import { useToast } from "@/hooks/use-toast";

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
    const { mutate: patchContentItems } = usePatchContentItems();
    const queryClient = useQueryClient();
    const { toast } = useToast();
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
        []
    );

    // 오늘 스케줄(시간 정보 있는 카드) 정리
    const timeLineEvents = useMemo(() => {
        const today = dayjs().format("YYYY-MM-DD");
        return boards
            .flatMap((board) =>
                board.contentItems
                    .filter((item) => item.startTime && item.endTime)
                    .map((item) => ({
                        id: item.id,
                        title: item.text,
                        start: dayjs(`${today} ${item.startTime}`),
                        end: dayjs(`${today} ${item.endTime}`),
                        isCompleted: item.isCompleted ?? false,
                        bigRank: item.bigRank ?? null,
                    }))
            )
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());
    }, [boards]);

    const handleToggleTimelineItem = (event: {
        id: number;
        title: string;
        start: dayjs.Dayjs;
        end: dayjs.Dayjs;
        isCompleted: boolean;
        bigRank: number | null;
    }) => {
        const newCompleted = !event.isCompleted;

        // 1) 로컬 boards 상태를 먼저 낙관적으로 업데이트해서 즉시 UI 반영
        setBoards((prev) =>
            prev.map((board) => ({
                ...board,
                contentItems: board.contentItems.map((item) =>
                    item.id === event.id ? { ...item, isCompleted: newCompleted } : item
                ),
            }))
        );

        // 해당 아이템의 현재 bigRank 찾기
        const currentItem = boards.flatMap((board) => board.contentItems).find((item) => item.id === event.id);

        patchContentItems(
            {
                contentItemId: event.id,
                data: {
                    text: event.title,
                    startTime: event.start.format("HH:mm"),
                    endTime: event.end.format("HH:mm"),
                    isCompleted: newCompleted,
                    bigRank: currentItem?.bigRank ?? undefined,
                },
            },
            {
                onSuccess: () => {
                    // 이 스케줄의 posts 쿼리만 정확히 무효화해서 보드/스케줄 UI를 즉시 동기화
                    queryClient.invalidateQueries({ queryKey: ["posts", scheduleId] });
                },
                onError: () => {
                    // 실패 시 로컬 상태를 원래대로 롤백
                    setBoards((prev) =>
                        prev.map((board) => ({
                            ...board,
                            contentItems: board.contentItems.map((item) =>
                                item.id === event.id ? { ...item, isCompleted: event.isCompleted } : item
                            ),
                        }))
                    );
                    toast({
                        title: "완료 상태 변경 실패",
                        description: "스케줄 완료 상태를 변경하는 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-6" suppressHydrationWarning>
            <LoadingOverlay open={isMutating} text="업데이트 중입니다..." />

            {/* 상단 헤더 영역 */}
            <header className="mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">일정 상세</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        이 일정에 대한 할 일 보드와 오늘 스케줄을 한 화면에서 확인하세요.
                    </p>
                </div>
            </header>

            {/* 메인 레이아웃: 데스크톱에서는 좌우 2컬럼, 모바일에서는 위아래 */}
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
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] items-start">
                    {/* 왼쪽: 할 일 보드 */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">할 일 보드</h2>
                                <span className="text-xs text-slate-500">
                                    드래그해서 순서를 바꾸고, 카드 안에서 세부 내용을 관리하세요.
                                </span>
                            </div>
                        </div>

                        <SortableContext items={boards.map((board) => board.id)}>
                            <div className="flex flex-col gap-4">
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
                            </div>
                        </SortableContext>
                    </section>

                    {/* 오른쪽: 오늘 스케줄 타임라인 */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-sky-800">오늘 스케줄</h2>
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                                TODAY
                            </span>
                        </div>
                        <p className="text-xs text-sky-700/80">시간대별로 정리된 오늘의 할 일을 한눈에 확인하세요.</p>
                        <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 max-h-[520px] overflow-y-auto space-y-2">
                            {timeLineEvents.length === 0 ? (
                                <p className="text-sm text-sky-700/70">등록된 시간 정보가 있는 카드가 없습니다.</p>
                            ) : (
                                timeLineEvents.map((event) => {
                                    const now = dayjs();
                                    const isCurrent =
                                        !event.isCompleted && now.isAfter(event.start) && now.isBefore(event.end);

                                    return (
                                        <div
                                            key={event.id}
                                            className={`rounded-lg px-3 py-2 flex flex-col gap-1 border-l-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ${
                                                event.isCompleted
                                                    ? "bg-slate-50 border-slate-300 opacity-60"
                                                    : isCurrent
                                                      ? "bg-sky-100 border-sky-500"
                                                      : "bg-white border-sky-400"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleTimelineItem(event)}
                                                        className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
                                                            event.isCompleted
                                                                ? "bg-green-500 border-green-500"
                                                                : "border-slate-300 bg-white hover:border-green-400"
                                                        }`}
                                                        aria-label={
                                                            event.isCompleted ? "스케줄 완료 취소" : "스케줄 완료 처리"
                                                        }
                                                    >
                                                        {event.isCompleted && (
                                                            <svg
                                                                className="w-2.5 h-2.5 text-white stroke-current stroke-[3]"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                            >
                                                                <path
                                                                    d="M5 13l4 4L19 7"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <span
                                                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                                                            event.isCompleted ? "text-slate-400" : "text-sky-700"
                                                        }`}
                                                    >
                                                        {event.start.format("HH:mm")} - {event.end.format("HH:mm")}
                                                        {event.bigRank && (
                                                            <span
                                                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                                                    event.bigRank === 1
                                                                        ? "bg-red-500 text-white"
                                                                        : event.bigRank === 2
                                                                          ? "bg-orange-500 text-white"
                                                                          : "bg-yellow-400 text-white"
                                                                }`}
                                                            >
                                                                BIG{event.bigRank}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                {isCurrent && (
                                                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                                                        진행 중
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`text-sm font-semibold break-words ${
                                                    event.isCompleted ? "line-through text-slate-400" : "text-slate-900"
                                                }`}
                                            >
                                                {event.title}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
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
