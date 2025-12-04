"use client";
import { SortableItem } from "@/app/components/SortableItem";
import addIcon from "@/assets/addIcon.png";
import deleteIcon from "@/assets/deleteIcon.png";
import editIcon from "@/assets/editIcon.png";
import moveIcon from "@/assets/moveIcon.png";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { boards } from "@/type/boards";
import { patchContentItemsType } from "@/type/contentItems";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import React, { useState } from "react";
interface BoardProps {
    id: number;
    items: { id: number; text: string; startTime: string | null; endTime: string | null }[];
    title: string;
    isDragOverlay?: boolean;
    handleEditBoard?: (boardId: number, newName: string) => void;
    handleDeleteBoard?: (boardId: number) => void;
    handleEditItem?: (itemId: number, data: patchContentItemsType) => void;
    handleDeleteItem?: (itemId: number) => void;
    handleAddItem?: (boardId: number, itemName: string) => void;
    anotherContentTimeLists?: (
        excludeContentId: number
    ) => { id: number; startTime: string | null; endTime: string | null }[];
}

export function Board({
    id,
    title,
    items,
    isDragOverlay,
    handleEditBoard,
    handleDeleteBoard,
    handleEditItem,
    handleDeleteItem,
    handleAddItem,
    anotherContentTimeLists,
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

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: {
            type: "board",
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragOverlay ? "none" : transition,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`w-full p-4 bg-gray-100 rounded-lg relative h-full
                ${isDragging ? "opacity-50" : ""}
                ${isDragOverlay ? "shadow-lg" : ""}
            `}
        >
            <ConfirmModal />
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button {...attributes} {...listeners} className="cursor-move shrink-0" suppressHydrationWarning>
                        <Image src={moveIcon} alt="moveIcon" width={20} height={20} />
                    </button>
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
            <div className="h-96 overflow-y-auto">
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                        <SortableItem
                            key={item.id}
                            id={Number(item.id)}
                            name={item.text}
                            startTime={item.startTime || null}
                            endTime={item.endTime || null}
                            handleDeleteItem={handleDeleteItem}
                            handleEditItem={handleEditItem}
                            anotherContentTimeLists={anotherContentTimeLists}
                        />
                    ))}
                </SortableContext>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAdd(e);
                }}
                className="flex items-center gap-2 mt-4 p-2 bg-white rounded-lg shadow-sm"
            >
                <input
                    type="text"
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    placeholder="할일 추가"
                    className="flex-1 pl-3 py-2 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
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
