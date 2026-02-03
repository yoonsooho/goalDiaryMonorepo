/**
 * ScheduleDetail 컴포넌트
 *
 * 일정 상세 페이지의 메인 레이아웃 컴포넌트입니다.
 *
 * 주요 기능:
 * - 좌측: 할 일 보드 영역 (할 일 카드들을 시간순으로 정렬하여 표시)
 * - 우측: 오늘 스케줄 타임라인 (시간 정보가 있는 카드들을 시간순으로 정렬하여 표시)
 *
 * 기능:
 * - 오늘 스케줄에서 완료 상태 토글
 * - 시간 교환 기능 (버튼 기반)
 * - WebSocket을 통한 팀 일정 실시간 동기화 (팀 일정인 경우)
 * - BIG1/BIG2/BIG3 랭크 표시
 */

"use client";

import dayjs from "dayjs";
import { BoardColumn } from "./BoardColumn";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useScheduleDetail } from "./hooks/useScheduleDetail";

export default function ScheduleDetail({ scheduleId }: { scheduleId: number }) {
    const {
        boards,
        isMutating,
        isSwapMode,
        firstSwapItemId,
        timelineEvents,
        scheduleTitle,
        anotherContentTimeLists,
        handleAddItem,
        handleEditItem,
        handleDeleteItem,
        handleAddBoard,
        handleEditBoard,
        handleDeleteBoard,
        handleToggleTimelineItem,
        handleSwapTimeClick,
        toggleSwapMode,
    } = useScheduleDetail(scheduleId);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6" suppressHydrationWarning>
            <LoadingOverlay open={isMutating} text="업데이트 중입니다..." />

            {/* 상단 헤더 영역 */}
            <header className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{scheduleTitle}</h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            이 일정에 대한 할 일 보드와 오늘 스케줄을 한 화면에서 확인하세요.
                        </p>
                    </div>
                    <button
                        onClick={toggleSwapMode}
                        className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                        {isSwapMode ? "시간 교환 모드 종료" : "시간 교환"}
                    </button>
                </div>
                {isSwapMode && (
                    <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            {firstSwapItemId
                                ? "교환할 두 번째 아이템을 선택하세요."
                                : "교환할 첫 번째 아이템을 선택하세요."}
                        </p>
                    </div>
                )}
            </header>

            {/* 메인 레이아웃: 데스크톱에서는 좌우 2컬럼, 모바일에서는 위아래 */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] items-start">
                {/* 왼쪽: 할 일 보드 */}
                <section className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-slate-900">할 일 보드</h2>
                            <span className="text-xs text-slate-500">카드 안에서 세부 내용을 관리하세요.</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {boards?.map((board) => (
                            <BoardColumn
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
                                isSwapMode={isSwapMode}
                                firstSwapItemId={firstSwapItemId}
                                onSwapTimeClick={handleSwapTimeClick}
                            />
                        ))}
                    </div>
                </section>

                {/* 오른쪽: 오늘 스케줄 타임라인 */}
                <section className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-semibold text-sky-800">오늘 스케줄</h2>
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                            TODAY
                        </span>
                    </div>
                    <p className="text-xs text-sky-700/80">시간대별로 정리된 오늘의 할 일을 한눈에 확인하세요.</p>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-2 sm:p-3 max-h-[400px] sm:max-h-[520px] overflow-y-auto space-y-2">
                        {timelineEvents.length === 0 ? (
                            <p className="text-sm text-sky-700/70">등록된 스케줄이 없습니다.</p>
                        ) : (
                            timelineEvents.map((event) => {
                                const now = dayjs();
                                const isCurrent =
                                    event.hasTime &&
                                    !event.isCompleted &&
                                    event.start &&
                                    event.end &&
                                    now.isAfter(event.start) &&
                                    now.isBefore(event.end);

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
                                                    {event.hasTime && event.start && event.end ? (
                                                        <>
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
                                                                    BIG
                                                                    {event.bigRank}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-slate-500">시간 미설정</span>
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
                                                                    BIG
                                                                    {event.bigRank}
                                                                </span>
                                                            )}
                                                        </>
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
        </div>
    );
}
