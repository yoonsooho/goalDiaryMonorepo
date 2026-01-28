/**
 * SortableItem 컴포넌트
 *
 * 각 보드 내의 개별 할 일 카드 컴포넌트입니다.
 *
 * 주요 기능:
 * - 드래그 앤 드롭으로 순서 변경 가능 (dnd-kit 사용)
 * - 할 일 텍스트 편집 (편집 모드 토글)
 * - 시간 설정 (시작 시간 + 지속 시간 입력)
 * - 완료 상태 토글 (체크박스)
 * - BIG1/BIG2/BIG3 랭크 지정 및 표시
 * - 시간 겹침 검증 (다른 카드와 시간이 겹치면 경고)
 * - 타임라인 바로 예약된 시간대 시각화
 * - 카드 삭제
 *
 * 상태 관리:
 * - isEditMode: 편집 모드 여부
 * - isChecked: 완료 상태
 * - currentBigRank: BIG 랭크 (1, 2, 3 또는 null)
 * - editStartTime, editDurationMinutes: 시간 입력 값
 */

"use client";
import deleteIcon from "@/assets/deleteIcon.png";
import editIcon from "@/assets/editIcon.png";
import moveIcon from "@/assets/moveIcon.png";
import { patchContentItemsType } from "@/type/contentItems";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
    bigRank?: number | null;
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
    bigRank = null,
    handleDeleteItem,
    handleEditItem,
    anotherContentTimeLists,
}: SortableItemProps) {
    const { toast } = useToast();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editValue, setEditValue] = useState(name);
    const [editStartTime, setEditStartTime] = useState(startTime || "");
    // duration(분) 단위 선택 – 기본 30분, 기존 데이터가 있으면 차이로 계산
    const initialDuration =
        startTime && endTime
            ? Math.max(5, dayjs(`2000-01-01 ${endTime}`).diff(dayjs(`2000-01-01 ${startTime}`), "minute"))
            : 30;
    const [editDurationMinutes, setEditDurationMinutes] = useState<number>(initialDuration);

    // 내부 완료 상태 관리
    const [isChecked, setIsChecked] = useState(isCompleted);
    const [currentBigRank, setCurrentBigRank] = useState<number | null>(bigRank ?? null);
    const [timeError, setTimeError] = useState<string | null>(null);

    const editRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (contentUpdateForm: patchContentItemsType) => {
        // duration을 기반으로 endTime 계산
        let computedEndTime: string | undefined = undefined;
        if (editStartTime && editDurationMinutes) {
            const start = dayjs(`2000-01-01 ${editStartTime}`);
            computedEndTime = start.add(editDurationMinutes, "minute").format("HH:mm");
        }

        if (anotherContentTimeLists && editStartTime && computedEndTime) {
            const otherItems = anotherContentTimeLists(id);
            const currentStart = dayjs(`2000-01-01 ${editStartTime}`);
            const currentEnd = dayjs(`2000-01-01 ${computedEndTime}`);

            if (currentStart.isAfter(currentEnd)) {
                setTimeError("종료 시간은 시작 시간보다 늦어야 합니다.");
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
                setTimeError("선택한 시간대에 이미 다른 일정이 있습니다.");
                toast({
                    title: "일정 겹침",
                    description: "선택한 시간대에 이미 다른 일정이 있습니다.",
                    variant: "destructive",
                });
                return;
            }
        }

        // 시간 검증을 통과하면 에러 메시지 제거
        setTimeError(null);
        // contentUpdateForm에 bigRank가 명시적으로 전달되면 그것을 사용 (null 포함), 없으면 currentBigRank 사용
        const finalBigRank = "bigRank" in contentUpdateForm ? contentUpdateForm.bigRank : (currentBigRank ?? undefined);
        handleEditItem?.(id, {
            ...contentUpdateForm,
            startTime: editStartTime || undefined,
            endTime: computedEndTime,
            bigRank: finalBigRank,
        });

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

    // props 변경 시 내부 완료 상태 동기화 (오른쪽 리스트 토글 등)
    useEffect(() => {
        setIsChecked(isCompleted);
    }, [isCompleted]);

    // props 변경 시 BIG 랭크 동기화
    useEffect(() => {
        setCurrentBigRank(bigRank ?? null);
    }, [bigRank]);

    // 실시간 시간 겹침 검증 (편집 모드일 때만)
    useEffect(() => {
        if (!isEditMode || !editStartTime || !editDurationMinutes || !anotherContentTimeLists) {
            // 편집 모드가 아니거나 필수 값이 없으면 에러 초기화
            if (!isEditMode) {
                setTimeError(null);
            }
            return;
        }

        // 계산된 종료 시간
        const start = dayjs(`2000-01-01 ${editStartTime}`);
        const computedEndTime = start.add(editDurationMinutes, "minute").format("HH:mm");
        const currentEnd = dayjs(`2000-01-01 ${computedEndTime}`);

        // 시작 시간이 종료 시간보다 늦으면 에러
        if (start.isAfter(currentEnd)) {
            setTimeError("종료 시간은 시작 시간보다 늦어야 합니다.");
            return;
        }

        // 다른 일정들과 겹치는지 체크
        const otherItems = anotherContentTimeLists(id);
        const isOverlapping = otherItems.some((item) => {
            if (!item.startTime || !item.endTime) return false;
            const otherStart = dayjs(`2000-01-01 ${item.startTime}`);
            const otherEnd = dayjs(`2000-01-01 ${item.endTime}`);
            return start.isBefore(otherEnd) && currentEnd.isAfter(otherStart);
        });

        if (isOverlapping) {
            setTimeError("선택한 시간대에 이미 다른 일정이 있습니다.");
        } else {
            setTimeError(null);
        }
    }, [isEditMode, editStartTime, editDurationMinutes, anotherContentTimeLists, id]);

    // 다른 카드들이 이미 사용 중인 시간대 정보 (현재 카드 제외)
    const otherTimeRanges = useMemo(() => {
        if (!anotherContentTimeLists) return [];
        const others = anotherContentTimeLists(id).filter((item) => item.startTime && item.endTime);
        const mapped = others.map((item) => ({
            start: dayjs(`2000-01-01 ${item.startTime!}`),
            end: dayjs(`2000-01-01 ${item.endTime!}`),
        }));
        // 시작 시간 기준 정렬
        mapped.sort((a, b) => a.start.valueOf() - b.start.valueOf());
        // 단순 병합 (겹치는 구간은 하나로)
        const merged: { start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];
        for (const range of mapped) {
            if (!merged.length) {
                merged.push(range);
                continue;
            }
            const last = merged[merged.length - 1];
            if (range.start.isBefore(last.end) && range.end.isAfter(last.start)) {
                // 겹치면 끝 시간을 확장
                if (range.end.isAfter(last.end)) {
                    last.end = range.end;
                }
            } else {
                merged.push(range);
            }
        }
        return merged;
    }, [anotherContentTimeLists, id]);

    // 타임라인 바(00:00~24:00)를 위한 구간 정보 계산
    const { occupiedSegments, currentSegment, nowPosition } = useMemo(() => {
        const base = dayjs("2000-01-01 00:00");
        const totalMinutes = 24 * 60;

        const toMinutes = (t: dayjs.Dayjs) => t.diff(base, "minute");

        const occupied = otherTimeRanges.map((range) => {
            const startMin = Math.max(0, toMinutes(range.start));
            const endMin = Math.min(totalMinutes, toMinutes(range.end));
            const width = Math.max(0, endMin - startMin);
            return {
                left: (startMin / totalMinutes) * 100,
                width: (width / totalMinutes) * 100,
            };
        });

        let current: { left: number; width: number } | null = null;
        if (editStartTime && editDurationMinutes) {
            const start = dayjs(`2000-01-01 ${editStartTime}`);
            const end = start.add(editDurationMinutes, "minute");
            const startMin = Math.max(0, toMinutes(start));
            const endMin = Math.min(totalMinutes, toMinutes(end));
            const width = Math.max(0, endMin - startMin);
            current = {
                left: (startMin / totalMinutes) * 100,
                width: (width / totalMinutes) * 100,
            };
        }

        const now = dayjs();
        const todayStart = now.startOf("day");
        const diffMin = now.diff(todayStart, "minute");
        const nowPos = diffMin >= 0 && diffMin <= totalMinutes ? (diffMin / totalMinutes) * 100 : null;

        return { occupiedSegments: occupied, currentSegment: current, nowPosition: nowPos };
    }, [otherTimeRanges, editStartTime, editDurationMinutes]);

    // 시작 시간 + duration 기준으로 계산된 종료 시간 텍스트
    const endTimePreview = useMemo(() => {
        if (!editStartTime || !editDurationMinutes) return null;
        const start = dayjs(`2000-01-01 ${editStartTime}`);
        return start.add(editDurationMinutes, "minute").format("HH:mm");
    }, [editStartTime, editDurationMinutes]);

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
                            className="flex flex-col gap-1"
                            onSubmit={(e) => {
                                e.preventDefault();
                                let contentUpdateForm = {
                                    text: editValue,
                                    isCompleted: isChecked,
                                };
                                handleSubmit(contentUpdateForm);
                            }}
                        >
                            <div className="flex items-center justify-between gap-2">
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

                                {/* BIG1 / BIG2 / BIG3 토글 버튼 */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {[1, 2, 3].map((rank) => {
                                        const active = currentBigRank === rank;
                                        const label = `BIG${rank}`;
                                        return (
                                            <button
                                                key={rank}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // 같은 랭크를 다시 누르면 null로 초기화, 아니면 해당 랭크로 설정
                                                    const next = currentBigRank === rank ? null : (rank as number);
                                                    setCurrentBigRank(next);
                                                    // handleSubmit을 사용해서 모든 필드(시간 포함)와 함께 저장
                                                    // null을 명시적으로 전달해야 백엔드에서 null로 저장됨
                                                    handleSubmit({
                                                        text: editValue,
                                                        isCompleted: isChecked,
                                                        bigRank: next === null ? null : next,
                                                    });
                                                    toast({
                                                        title: next
                                                            ? `BIG${next}로 설정되었습니다`
                                                            : "BIG 랭크가 해제되었습니다",
                                                        description: next
                                                            ? `이 일정이 ${next === 1 ? "가장" : next === 2 ? "두 번째로" : "세 번째로"} 중요한 일정으로 표시됩니다.`
                                                            : "",
                                                    });
                                                }}
                                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border transition-colors
                                                    ${
                                                        active
                                                            ? rank === 1
                                                                ? "bg-red-500 text-white border-red-500"
                                                                : rank === 2
                                                                  ? "bg-orange-500 text-white border-orange-500"
                                                                  : "bg-yellow-400 text-white border-yellow-400"
                                                            : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>
                        {/* 시간 입력/표시 영역 */}
                        {isEditMode ? (
                            <>
                                {/* 편집 모드일 때: 시간 입력 영역 + 저장 버튼 표시 */}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <input
                                        type="time"
                                        value={editStartTime}
                                        onChange={(e) => setEditStartTime(e.target.value)}
                                        className={`text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 bg-white w-32 min-w-[130px] ${
                                            timeError
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                    <span className="text-gray-400 text-sm">+ </span>
                                    <input
                                        type="number"
                                        min={5}
                                        max={24 * 60}
                                        step={5}
                                        value={editDurationMinutes}
                                        onChange={(e) =>
                                            setEditDurationMinutes(
                                                Math.max(5, Math.min(24 * 60, Number(e.target.value) || 0))
                                            )
                                        }
                                        className={`text-sm px-2 py-1 border rounded bg-white focus:outline-none focus:ring-2 w-20 ${
                                            timeError
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                    <span className="text-gray-400 text-xs">분</span>
                                    <div className="flex gap-1">
                                        {[15, 30, 60].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                className="px-2 py-0.5 text-[11px] rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setEditDurationMinutes((prev) =>
                                                        Math.min(24 * 60, (prev || 0) + p)
                                                    );
                                                }}
                                            >
                                                +{p}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="text-xs text-blue-600 font-medium hover:underline px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            let contentUpdateForm = {
                                                text: editValue,
                                                isCompleted: isChecked,
                                            };
                                            handleSubmit(contentUpdateForm);
                                        }}
                                    >
                                        저장
                                    </button>
                                </div>
                                {timeError && (
                                    <p className="mt-1 text-xs text-red-500 whitespace-pre-wrap">{timeError}</p>
                                )}
                                {!timeError && endTimePreview && editStartTime && (
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        {editStartTime} 부터 {editDurationMinutes}분 →{" "}
                                        <span className="font-medium text-gray-700">{endTimePreview}</span> 종료
                                    </p>
                                )}
                            </>
                        ) : startTime || endTime ? (
                            // 편집 모드가 아니고 시간이 있을 때: 시간 + 기간 표시
                            <div
                                className={`flex items-center gap-1.5 mt-1.5 text-sm transition-colors duration-300 ${
                                    isChecked ? "text-gray-300" : "text-gray-500"
                                }`}
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
                                        className={`text-sm px-2 py-1 border rounded focus:outline-none focus:ring-2 bg-gray-50 w-32 min-w-[130px] ${
                                            timeError
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                    <span className="text-gray-400 text-sm">+ </span>
                                    <input
                                        type="number"
                                        min={5}
                                        max={24 * 60}
                                        step={5}
                                        value={editDurationMinutes}
                                        onChange={(e) =>
                                            setEditDurationMinutes(
                                                Math.max(5, Math.min(24 * 60, Number(e.target.value) || 0))
                                            )
                                        }
                                        className={`text-sm px-2 py-1 border rounded bg-gray-50 focus:outline-none focus:ring-2 w-20 ${
                                            timeError
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    />
                                    <span className="text-gray-400 text-xs">분</span>
                                    <div className="flex gap-1">
                                        {[15, 30, 60].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                className="px-2 py-0.5 text-[11px] rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setEditDurationMinutes((prev) =>
                                                        Math.min(24 * 60, (prev || 0) + p)
                                                    );
                                                }}
                                            >
                                                +{p}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="text-xs text-blue-600 font-medium hover:underline px-2"
                                        onClick={() => {
                                            let contentUpdateForm = {
                                                text: editValue,
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
                        {/* 이미 예약된 시간대 타임라인 바로 표시 */}
                        {otherTimeRanges.length > 0 && (
                            <div className="mt-3">
                                <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                    {/* 이미 예약된 구간 */}
                                    {occupiedSegments.map((seg, idx) => (
                                        <div
                                            key={`${seg.left}-${seg.width}-${idx}`}
                                            className="absolute top-0 h-full bg-slate-400/80"
                                            style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                                        />
                                    ))}
                                    {/* 현재 카드의 구간 */}
                                    {currentSegment && currentSegment.width > 0 && (
                                        <div
                                            className="absolute top-0 h-full bg-sky-400/90"
                                            style={{
                                                left: `${currentSegment.left}%`,
                                                width: `${currentSegment.width}%`,
                                            }}
                                        />
                                    )}
                                    {/* 현재 시간 위치 */}
                                    {nowPosition !== null && (
                                        <div
                                            className="absolute top-[-2px] h-[10px] w-[2px] bg-rose-500"
                                            style={{ left: `${nowPosition}%` }}
                                        />
                                    )}
                                </div>
                                <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                                    <span>00:00</span>
                                    <span>24:00</span>
                                </div>
                            </div>
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
