"use client";
import deleteIcon from "@/assets/deleteIcon.png";
import editIcon from "@/assets/editIcon.png";
import moveIcon from "@/assets/moveIcon.png";
import { patchContentItemsType } from "@/type/contentItems";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "@/hooks/use-toast";

interface SortableItemProps {
    id: number;
    name: string;
    startTime?: string | null;
    endTime?: string | null;
    isDragOverlay?: boolean;
    // [추가] 완료 상태 props (나중에 서버 데이터와 연결)
    isCompleted?: boolean;
    handleDeleteItem?: (itemId: number) => void;
    handleEditItem?: (itemId: number, data: patchContentItemsType) => void;
    anotherContentTimeLists?: (
        excludeContentId: number
    ) => { id: number; startTime: string | null; endTime: string | null }[];
}

export function SortableItem({
    id,
    name,
    startTime = null,
    endTime = null,
    isDragOverlay,
    isCompleted = false, // 기본값 false
    handleDeleteItem,
    handleEditItem,
    anotherContentTimeLists,
}: SortableItemProps) {
    const { toast } = useToast();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editValue, setEditValue] = useState(name);
    const [editStartTime, setEditStartTime] = useState(startTime || "");
    const [editEndTime, setEditEndTime] = useState(endTime || "");

    // [추가] 내부 완료 상태 관리 (Props가 없을 때도 UI 동작 확인용)
    const [isChecked, setIsChecked] = useState(isCompleted);

    const editRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (contentUpdateForm: patchContentItemsType) => {
        if (anotherContentTimeLists && editStartTime && editEndTime) {
            const otherItems = anotherContentTimeLists(id);
            const currentStart = dayjs(`2000-01-01 ${editStartTime}`);
            const currentEnd = dayjs(`2000-01-01 ${editEndTime}`);

            if (currentStart.isAfter(currentEnd)) {
                toast({
                    title: "시간 설정 오류",
                    description: "종료 시간은 시작 시간보다 늦어야 합니다.",
                    variant: "destructive",
                });
                return;
            }

            const isOverlapping = otherItems.some((item) => {
                if (!item.startTime || !item.endTime) return false;
                const otherStart = dayjs(`2000-01-01 ${item.startTime}`);
                const otherEnd = dayjs(`2000-01-01 ${item.endTime}`);
                return currentStart.isBefore(otherEnd) && currentEnd.isAfter(otherStart);
            });

            if (isOverlapping) {
                toast({
                    title: "일정 겹침",
                    description: "선택한 시간대에 이미 다른 일정이 있습니다.",
                    variant: "destructive",
                });
                return;
            }
        }

        console.log("contentUpdateForm", contentUpdateForm);
        handleEditItem?.(id, contentUpdateForm);

        setIsEditMode(false);
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled: isDragOverlay,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragOverlay ? undefined : "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)",
        opacity: isDragging ? 0.3 : 1,
        scale: isDragOverlay ? 1.05 : 1,
    };

    useEffect(() => {
        if (isEditMode) {
            editRef.current?.focus();
        }
    }, [isEditMode]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                p-4 mb-2 rounded shadow transition-all duration-300  
                ${isDragging ? "border-2 border-blue-500 z-50" : ""}
                ${isDragOverlay ? "shadow-lg cursor-grabbing" : ""}
                ${isChecked ? "bg-gray-50" : "bg-white"} 
            `}
        >
            <div className="flex items-start gap-3">
                {/* [추가] 커스텀 체크박스 버튼 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // 드래그 이벤트 전파 방지
                        let newIsChecked = !isChecked;
                        setIsChecked(newIsChecked);
                        let contentUpdateForm = {
                            text: editValue,
                            startTime: editStartTime ? editStartTime : undefined,
                            endTime: editEndTime ? editEndTime : undefined,
                            isCompleted: newIsChecked,
                        };
                        handleSubmit(contentUpdateForm);
                    }}
                    className={`
                        shrink-0 w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center transition-all duration-200
                        ${
                            isChecked
                                ? "bg-green-500 border-green-500 shadow-sm"
                                : "border-gray-300 hover:border-green-400 bg-white"
                        }
                    `}
                    aria-label={isChecked ? "완료 취소" : "완료 하기"}
                >
                    {isChecked && (
                        <svg
                            className="w-3.5 h-3.5 text-white stroke-current stroke-[3]"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>

                {/* 드래그 핸들 & 수정 버튼 & 내용 */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing shrink-0 mt-1 opacity-50 hover:opacity-100 transition-opacity"
                        suppressHydrationWarning
                    >
                        <Image src={moveIcon} alt="moveIcon" width={20} height={20} />
                    </span>

                    <button
                        className="p-1 mt-0.5 hover:bg-gray-100 rounded transition-colors shrink-0 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isEditMode) {
                                // 편집 모드일 때 다시 누르면 편집 모드만 종료 (저장 안 함)
                                setIsEditMode(false);
                            } else {
                                // 편집 모드가 아닐 때 누르면 편집 모드 시작
                                setIsEditMode(true);
                            }
                        }}
                    >
                        <Image src={editIcon} alt="editIcon" width={18} height={18} />
                    </button>

                    <div className="flex-1 min-w-0">
                        {" "}
                        {/* min-w-0는 flex 자식의 text-overflow 처리를 위해 필수 */}
                        <form
                            className="flex flex-col"
                            onSubmit={(e) => {
                                e.preventDefault();
                                let contentUpdateForm = {
                                    text: editValue,
                                    startTime: editStartTime ? editStartTime : undefined,
                                    endTime: editEndTime ? editEndTime : undefined,
                                    isCompleted: isChecked,
                                };
                                handleSubmit(contentUpdateForm);
                            }}
                        >
                            {isEditMode ? (
                                <textarea
                                    ref={editRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            let contentUpdateForm = {
                                                text: editValue,
                                                startTime: editStartTime ? editStartTime : undefined,
                                                endTime: editEndTime ? editEndTime : undefined,
                                                isCompleted: isChecked,
                                            };
                                            handleSubmit(contentUpdateForm);
                                        }
                                    }}
                                    className="text-lg font-bold w-full resize-none border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                    rows={2}
                                />
                            ) : (
                                <h2
                                    className={`text-lg font-bold w-full break-words whitespace-pre-wrap transition-all duration-300
                                        ${isChecked ? "line-through text-gray-400" : "text-gray-800"}
                                    `}
                                >
                                    {name}
                                </h2>
                            )}
                        </form>
                        {/* 시간 입력/표시 영역 */}
                        {isEditMode ? (
                            // 편집 모드일 때: 시간 입력 영역 + 저장 버튼 표시
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <input
                                    type="time"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-28"
                                />
                                <span className="text-gray-400 text-sm">~</span>
                                <input
                                    type="time"
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.target.value)}
                                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-28"
                                />
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 font-medium hover:underline px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        let contentUpdateForm = {
                                            text: editValue,
                                            startTime: editStartTime ? editStartTime : undefined,
                                            endTime: editEndTime ? editEndTime : undefined,
                                            isCompleted: isChecked,
                                        };
                                        handleSubmit(contentUpdateForm);
                                    }}
                                >
                                    저장
                                </button>
                            </div>
                        ) : startTime || endTime ? (
                            // 편집 모드가 아니고 시간이 있을 때: 시간 표시
                            <div
                                className={`flex items-center gap-1.5 mt-1.5 text-sm transition-colors duration-300 ${isChecked ? "text-gray-300" : "text-gray-500"}`}
                            >
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-medium">Time</span>
                                <span>{startTime || "..."}</span>
                                <span>~</span>
                                <span>{endTime || "..."}</span>
                            </div>
                        ) : (
                            // 편집 모드가 아니고 시간이 없을 때: 시간 입력 영역 (완료 상태가 아닐 때만)
                            !isChecked && (
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <input
                                        type="time"
                                        value={editStartTime}
                                        onChange={(e) => setEditStartTime(e.target.value)}
                                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 w-28"
                                    />
                                    <span className="text-gray-400 text-sm">~</span>
                                    <input
                                        type="time"
                                        value={editEndTime}
                                        onChange={(e) => setEditEndTime(e.target.value)}
                                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 w-28"
                                    />
                                    <button
                                        className="text-xs text-blue-600 font-medium hover:underline px-2"
                                        onClick={() => {
                                            let contentUpdateForm = {
                                                text: editValue,
                                                startTime: editStartTime ? editStartTime : undefined,
                                                endTime: editEndTime ? editEndTime : undefined,
                                                isCompleted: isChecked,
                                            };
                                            handleSubmit(contentUpdateForm);
                                        }}
                                    >
                                        저장
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <button
                    className="p-2 hover:bg-red-50 rounded-full transition-colors shrink-0 group"
                    onClick={() => handleDeleteItem?.(id)}
                    title="삭제"
                >
                    <Image
                        className="opacity-40 group-hover:opacity-100 transition-opacity"
                        src={deleteIcon}
                        alt="deleteIcon"
                        width={18}
                        height={18}
                    />
                </button>
            </div>
        </div>
    );
}
