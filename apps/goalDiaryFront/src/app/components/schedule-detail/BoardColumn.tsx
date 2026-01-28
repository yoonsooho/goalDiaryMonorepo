"use client";
import { TaskCard } from "./TaskCard";
import addIcon from "@/assets/addIcon.png";
import deleteIcon from "@/assets/deleteIcon.png";
import editIcon from "@/assets/editIcon.png";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { boards } from "@/type/boards";
import { patchContentItemsType } from "@/type/contentItems";
import Image from "next/image";
import React, { useState } from "react";
interface BoardProps {
    id: number;
    items: {
        id: number;
        text: string;
        startTime: string | null;
        endTime: string | null;
        isCompleted: boolean;
        seq?: number;
        bigRank?: number | null;
    }[];
    title: string;
    handleEditBoard?: (boardId: number, newName: string) => void;
    handleDeleteBoard?: (boardId: number) => void;
    handleEditItem?: (itemId: number, data: patchContentItemsType) => void;
    handleDeleteItem?: (itemId: number) => void;
    handleAddItem?: (boardId: number, itemName: string) => void;
    anotherContentTimeLists?: (
        excludeContentId: number
    ) => { id: number; startTime: string | null; endTime: string | null }[];
    isSwapMode?: boolean;
    firstSwapItemId?: number | null;
    onSwapTimeClick?: (itemId: number) => void;
}

export function BoardColumn({
    id,
    title,
    items,
    handleEditBoard,
    handleDeleteBoard,
    handleEditItem,
    handleDeleteItem,
    handleAddItem,
    anotherContentTimeLists,
    isSwapMode = false,
    firstSwapItemId = null,
    onSwapTimeClick,
}: BoardProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [editValue, setEditValue] = useState(title);
    const [addValue, setAddValue] = useState("");
    const { openConfirm, ConfirmModal } = useConfirmModal();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editValue.trim() && editValue !== title) {
            handleEditBoard?.(id, editValue);
        }
        setIsEditMode(false);
    };

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (addValue.trim() && title) {
            handleAddItem?.(id, addValue);
            setAddValue("");
        }
    };

    // 시간/seq 기준으로 정렬된 아이템 목록
    const orderedItems = [
        // 먼저 시간 있는 아이템들: startTime 오름차순, 같으면 seq(또는 id) 순
        ...items
            .filter((item) => item.startTime && item.endTime)
            .sort((a, b) => {
                if (a.startTime && b.startTime && a.startTime !== b.startTime) {
                    return a.startTime.localeCompare(b.startTime);
                }
                return (a.seq ?? a.id) - (b.seq ?? b.id);
            }),
        // 그 다음 시간 없는 아이템들: seq(또는 id) 순
        ...items.filter((item) => !item.startTime || !item.endTime).sort((a, b) => (a.seq ?? a.id) - (b.seq ?? b.id)),
    ];

    return (
        <div className="w-full p-4 bg-gray-100 rounded-lg relative h-full">
            <ConfirmModal />
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 hover:rounded-full hover:bg-gray-200 shrink-0"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsEditMode(!isEditMode);
                        }}
                    >
                        <Image src={editIcon} alt="editIcon" width={20} height={20} />
                    </button>
                    <form className="flex items-center" onSubmit={(e) => handleSubmit(e)}>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={(e) => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)}
                                className="text-lg font-bold w-full"
                            />
                        ) : (
                            <h2 className="text-lg font-bold w-full">{title}</h2>
                        )}
                    </form>
                </div>

                <button
                    className="p-2 hover:rounded-full hover:bg-gray-200 shrink-0"
                    onClick={() =>
                        openConfirm(() => handleDeleteBoard?.(id), {
                            title: "보드 삭제",
                            description: `"${title}" 보드를 정말 삭제하시겠습니까?`,
                            confirmText: "삭제",
                            cancelText: "취소",
                            variant: "destructive",
                        })
                    }
                >
                    {/* <Image src={deleteIcon} alt="deleteIcon" width={20} height={20} /> */}
                </button>
            </div>
            <div className="h-96 overflow-y-auto px-1 py-1">
                {/* 시간이 설정된 아이템을 startTime 기준으로 정렬 */}
                {orderedItems.map((item) => (
                    <TaskCard
                        key={item.id}
                        id={Number(item.id)}
                        name={item.text}
                        startTime={item.startTime || null}
                        endTime={item.endTime || null}
                        isCompleted={item.isCompleted || false}
                        bigRank={item?.bigRank ?? null}
                        handleDeleteItem={handleDeleteItem}
                        handleEditItem={handleEditItem}
                        anotherContentTimeLists={anotherContentTimeLists}
                        isSwapMode={isSwapMode}
                        isSelectedForSwap={firstSwapItemId === item.id}
                        onSwapTimeClick={onSwapTimeClick}
                    />
                ))}
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAdd(e);
                }}
                className="flex items-center gap-2 mt-4 p-2 bg-white rounded-lg shadow-sm"
            >
                <textarea
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return; // 한글 조합 중이면 무시
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAdd(e as unknown as React.FormEvent<HTMLFormElement>);
                        }
                    }}
                    placeholder="할일 추가"
                    className="flex-1 pl-3 py-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md resize-none"
                />
                <button
                    type="submit"
                    disabled={!addValue.trim()}
                    className="p-2 hover:rounded-full hover:bg-gray-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    <div className="flex items-center">
                        <Image src={addIcon} alt="addIcon" width={20} height={20} />
                    </div>
                </button>
            </form>
        </div>
    );
}
