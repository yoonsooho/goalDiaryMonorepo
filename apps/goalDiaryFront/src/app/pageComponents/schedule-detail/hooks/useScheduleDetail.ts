"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useMutationState, useQueryClient } from "@tanstack/react-query";

import useBoardHandler from "@/app/hooks/useBoardHandler";
import useItemHandler from "@/app/hooks/useItemHandler";
import { useGetPosts } from "@/app/hooks/apiHook/usePost";
import { useScheduleWebSocket } from "@/app/hooks/useScheduleWebSocket";
import { usePatchContentItems, useSwapContentItemTimes } from "@/app/hooks/apiHook/useContentItem";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useGetSchedules } from "@/app/hooks/apiHook/useSchedules";
import { GetSchedulesType } from "@/type/ScheduleType";
import { boards } from "@/type/boards";

type TimelineEvent = {
    id: number;
    title: string;
    start: dayjs.Dayjs | null;
    end: dayjs.Dayjs | null;
    hasTime: boolean;
    isCompleted: boolean;
    bigRank: number | null;
};

export function useScheduleDetail(scheduleId: number) {
    const searchParams = useSearchParams();
    const isTeam = searchParams.get("isTeam") === "true";

    // WebSocket 연결 (팀 일정인 경우 실시간 동기화)
    useScheduleWebSocket(scheduleId, { enabled: isTeam });

    const { data: boardsData } = useGetPosts(scheduleId);
    const [boards, setBoards] = useState<boards>(() => boardsData || []);

    // 시간 교환 모드 상태
    const [isSwapMode, setIsSwapMode] = useState(false);
    const [firstSwapItemId, setFirstSwapItemId] = useState<number | null>(null);

    const { mutate: patchContentItems } = usePatchContentItems();
    const { mutate: swapContentItemTimes } = useSwapContentItemTimes();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // 렌더 중에 바로 state를 건드리지 않도록 toast 호출을 비동기로 래핑
    const showToast = (props: Parameters<typeof toast>[0]) => {
        setTimeout(() => {
            toast(props);
        }, 0);
    };

    const { handleAddItem, handleEditItem, handleDeleteItem } = useItemHandler(setBoards);
    const { handleAddBoard, handleEditBoard, handleDeleteBoard } = useBoardHandler(setBoards, scheduleId);

    const postsPending = useMutationState({ filters: { status: "pending", mutationKey: ["posts"] } });
    const contentItemsPending = useMutationState({ filters: { status: "pending", mutationKey: ["contentItems"] } });

    // React Query 데이터가 업데이트되면 동기화
    useLayoutEffect(() => {
        if (boardsData) {
            setBoards(boardsData);
        }
    }, [boardsData]);

    const isMutating = postsPending.length > 0 || contentItemsPending.length > 0;

    const anotherContentTimeLists = useMemo(
        () => (boardsValue: boards) => (excludeContentId: number) => {
            return boardsValue
                .flatMap((board) => board.contentItems.filter((item) => item.id !== excludeContentId))
                .map((item) => ({
                    id: item.id,
                    startTime: item.startTime,
                    endTime: item.endTime,
                }));
        },
        []
    );

    // 오늘 스케줄 정리: 시간 있는 것 먼저, 그 다음 BIG 랭크 있는 것
    const timelineEvents: TimelineEvent[] = useMemo(() => {
        const today = dayjs().format("YYYY-MM-DD");
        const allItems = boards.flatMap((board) => board.contentItems);

        // 시간 있는 아이템들
        const timedItems = allItems
            .filter((item) => item.startTime && item.endTime)
            .map((item) => ({
                id: item.id,
                title: item.text,
                start: dayjs(`${today} ${item.startTime}`),
                end: dayjs(`${today} ${item.endTime}`),
                hasTime: true,
                isCompleted: item.isCompleted ?? false,
                bigRank: item.bigRank ?? null,
            }))
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());

        // 시간 없지만 BIG 랭크 있는 아이템들
        const bigRankItems = allItems
            .filter((item) => (!item.startTime || !item.endTime) && item.bigRank)
            .map((item) => ({
                id: item.id,
                title: item.text,
                start: null as dayjs.Dayjs | null,
                end: null as dayjs.Dayjs | null,
                hasTime: false,
                isCompleted: item.isCompleted ?? false,
                bigRank: item.bigRank ?? null,
            }))
            .sort((a, b) => (a.bigRank ?? 0) - (b.bigRank ?? 0)); // BIG1, BIG2, BIG3 순

        return [...timedItems, ...bigRankItems];
    }, [boards]);

    const handleToggleTimelineItem = (event: TimelineEvent) => {
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
                    startTime: event.start ? event.start.format("HH:mm") : undefined,
                    endTime: event.end ? event.end.format("HH:mm") : undefined,
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
                    showToast({
                        title: "완료 상태 변경 실패",
                        description: "스케줄 완료 상태를 변경하는 중 오류가 발생했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const { data: schedulesData } = useGetSchedules();
    const scheduleTitle = schedulesData?.find(
        (schedule: GetSchedulesType) => String(schedule.id) === String(scheduleId)
    )?.title;

    // 시간 교환 핸들러
    const handleSwapTimeClick = (itemId: number) => {
        if (!isSwapMode) return;

        if (firstSwapItemId === null) {
            // 첫 번째 아이템 선택
            setFirstSwapItemId(itemId);
            showToast({
                title: "첫 번째 아이템 선택됨",
                description: "교환할 두 번째 아이템을 선택하세요.",
            });
        } else if (firstSwapItemId === itemId) {
            // 같은 아이템을 다시 클릭하면 선택 해제
            setFirstSwapItemId(null);
            showToast({
                title: "선택 취소",
                description: "다시 첫 번째 아이템을 선택하세요.",
            });
        } else {
            // 두 번째 아이템 선택 - 교환 실행
            const firstItem = boards.flatMap((board) => board.contentItems).find((item) => item.id === firstSwapItemId);
            const secondItem = boards.flatMap((board) => board.contentItems).find((item) => item.id === itemId);

            // 두 아이템 모두 시간이 있어야 교환 가능
            if (!firstItem?.startTime || !firstItem?.endTime || !secondItem?.startTime || !secondItem?.endTime) {
                showToast({
                    title: "시간 교환 불가",
                    description: "시간이 설정된 두 아이템만 교환할 수 있습니다.",
                    variant: "destructive",
                });
                setFirstSwapItemId(null);
                return;
            }

            // 낙관적 업데이트
            setBoards((prev) =>
                prev.map((board) => ({
                    ...board,
                    contentItems: board.contentItems.map((item) => {
                        if (item.id === firstSwapItemId) {
                            return {
                                ...item,
                                startTime: secondItem.startTime,
                                endTime: secondItem.endTime,
                            };
                        }
                        if (item.id === itemId) {
                            return {
                                ...item,
                                startTime: firstItem.startTime,
                                endTime: firstItem.endTime,
                            };
                        }
                        return item;
                    }),
                }))
            );

            // 백엔드에 교환 요청
            swapContentItemTimes(
                {
                    firstContentItemId: firstSwapItemId,
                    secondContentItemId: itemId,
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["posts", scheduleId] });
                        showToast({
                            title: "시간 교환 완료",
                            description: "두 일정의 시간이 서로 교환되었습니다.",
                        });
                        setIsSwapMode(false);
                        setFirstSwapItemId(null);
                    },
                    onError: () => {
                        // 실패 시 롤백
                        queryClient.invalidateQueries({ queryKey: ["posts", scheduleId] });
                        showToast({
                            title: "시간 교환 실패",
                            description: "시간 교환 중 오류가 발생했습니다.",
                            variant: "destructive",
                        });
                        setIsSwapMode(false);
                        setFirstSwapItemId(null);
                    },
                }
            );
        }
    };

    const toggleSwapMode = () => {
        setIsSwapMode((prev) => {
            const next = !prev;
            setFirstSwapItemId(null);
            if (prev) {
                showToast({
                    title: "시간 교환 모드 종료",
                    description: "시간 교환 모드가 종료되었습니다.",
                });
            } else {
                showToast({
                    title: "시간 교환 모드 시작",
                    description: "교환할 첫 번째 아이템을 선택하세요.",
                });
            }
            return next;
        });
    };

    return {
        // 상태
        boards,
        isMutating,
        isSwapMode,
        firstSwapItemId,
        timelineEvents,
        scheduleTitle,

        // 파생 데이터/함수
        anotherContentTimeLists,

        // 보드/아이템 조작 핸들러
        handleAddItem,
        handleEditItem,
        handleDeleteItem,
        handleAddBoard,
        handleEditBoard,
        handleDeleteBoard,

        // 타임라인/시간 교환 핸들러
        handleToggleTimelineItem,
        handleSwapTimeClick,
        toggleSwapMode,
    };
}
