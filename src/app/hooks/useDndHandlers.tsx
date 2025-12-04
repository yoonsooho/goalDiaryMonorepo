import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { board, boards } from "../../type/boards";
import { DndHelpers } from "../../type/dndHelpers";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdatePosts, useUpdateSeqPosts } from "@/app/hooks/apiHook/usePost";
import { toast } from "@/hooks/use-toast";
import { useUpdateMoveContentItems } from "@/app/hooks/apiHook/useContentItem";

const useDndHandlers = (
    items: boards,
    setItems: React.Dispatch<React.SetStateAction<boards>>,
    setActiveId: (id: number | null) => void,
    helpers: DndHelpers,
    scheduleId: number,
    firstActiveBoardId: number | null
) => {
    const queryClient = useQueryClient();
    const { mutate: updateSeqPosts } = useUpdateSeqPosts(scheduleId);
    const { mutate: updateMoveContentItems } = useUpdateMoveContentItems();

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(active.id as number);
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over) return;

        const activeItemId = active.id as number;
        const overItemId = over.id as number;

        // 보드가 이동할때 이동하는 경우
        if (helpers.isSomeBoard(activeItemId)) {
            const oldIndex = items.findIndex((c) => c.id === activeItemId);
            const newIndex = items.findIndex((c) => c.id === overItemId);
            let updatedItems = arrayMove(items, oldIndex, newIndex);
            setItems(updatedItems);
            let updatedSeqItems = updatedItems.map((item, index) => ({ id: item.id, seq: index + 1 }));
            if (oldIndex !== newIndex) {
                updateSeqPosts(updatedSeqItems, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["posts", scheduleId] });
                        toast({
                            title: "아이템 이동을 완료했습니다.",
                            description: "아이템 이동을 완료했습니다.",
                        });
                    },
                    onError: (error) => {
                        console.error("아이템 이동 실패:", error);
                        toast({
                            title: "아이템 이동을 실패했습니다.",
                            description: "아이템 이동을 실패했습니다.",
                            variant: "destructive",
                        });
                    },
                });
            }
            return;
        }

        // 아이템이 이동하는 경우
        const activeBoardIdx = helpers.findBoardIdx(activeItemId);
        const moveBeforePostItems = items.find((item) => item.contentItems.some((c) => c.id === overItemId));
        const moveAfterPostItems = items.find((item) => item.contentItems.some((c) => c.id === activeItemId));

        // if (activeBoardIdx && activeBoardIdx !== -1) {
        const boardItems = helpers.getBoardItems(activeBoardIdx);
        const oldIndex = boardItems.findIndex((item) => item.id === activeItemId);
        const newIndex = boardItems.findIndex((item) => item.id === overItemId);
        setItems((prev: boards) => {
            const newItems = [...prev];
            newItems[activeBoardIdx].contentItems = arrayMove(boardItems, oldIndex, newIndex);
            return newItems;
        });

        if (!moveBeforePostItems || !moveAfterPostItems || !firstActiveBoardId) return;
        updateMoveContentItems(
            {
                contentItemId: activeItemId,
                fromPostId: firstActiveBoardId.toString(),
                toPostId: moveBeforePostItems.id.toString(),
                toPostContentItems: moveAfterPostItems.contentItems.map((item, i) => ({
                    id: item.id,
                    seq: i + 1,
                })),
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["posts", scheduleId] });
                    toast({
                        title: "아이템 이동을 완료했습니다.",
                        description: "아이템 이동을 완료했습니다.",
                    });
                },
                onError: (error) => {
                    console.error("아이템 이동 실패:", error);
                    toast({
                        title: "아이템 이동을 실패했습니다.",
                        description: "아이템 이동을 실패했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
        // }
        setActiveId(null);
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return;

        const activeBoardIdx = helpers.findBoardIdx(active.id as number);
        //오버된 아이템이 보드인지 확인
        const isOverBoard = helpers.isSomeBoard(over.id as number);

        //만약 오버된 요소가 보드가 아니라면 아이템 Index를 반환 보드가 맞다면 보드 Index를 반환
        const overBoardIdx = isOverBoard
            ? items.findIndex((el) => el.id === over.id)
            : helpers.findBoardIdx(over.id as number);

        if (activeBoardIdx === -1 || overBoardIdx === -1 || activeBoardIdx === overBoardIdx) return;

        setItems((prev: boards) => {
            const newItems = [...prev];
            const activeItem = prev[activeBoardIdx].contentItems.find((item) => item.id === active.id);
            if (!activeItem) return prev;

            newItems[activeBoardIdx].contentItems = prev[activeBoardIdx].contentItems.filter(
                (item) => item.id !== active.id
            );

            const overItems = newItems[overBoardIdx].contentItems;
            newItems[overBoardIdx].contentItems = isOverBoard
                ? [...overItems, activeItem]
                : overItems.length === 0
                ? [activeItem]
                : [
                      ...overItems.slice(
                          0,
                          overItems.findIndex((item) => item.id === over.id)
                      ),
                      activeItem,
                      ...overItems.slice(overItems.findIndex((item) => item.id === over.id)),
                  ];

            return newItems;
        });
    };

    return {
        handleDragStart,
        handleDragEnd,
        handleDragOver,
    };
};

export default useDndHandlers;
