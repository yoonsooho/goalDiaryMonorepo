"use client";

import { Calendar, dayjsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";

// dayjs 한국어 설정
dayjs.locale("ko");

// dayjsLocalizer 초기화
const localizer = dayjsLocalizer(dayjs);

export interface CalendarEvent {
    id?: string | number;
    title: string;
    startTime: Date;
    endTime: Date;
    resource?: any;
}

export interface BigCalendarProps {
    events?: CalendarEvent[];
    defaultDate?: Date;
    onSelectEvent?: (event: CalendarEvent) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void;
    onNavigate?: (date: Date) => void;
    className?: string;
    style?: React.CSSProperties;
    height?: number | string;
    selectable?: boolean;
    popup?: boolean;
    min?: Date; // 최소 시간
    max?: Date; // 최대 시간
    step?: number; // 시간 간격 (분)
    timeslots?: number; // 시간 슬롯 수
    defaultView?: View;
    views?: View[];
}

export default function BigCalendar({
    events = [],
    defaultDate = new Date(),
    onSelectEvent,
    onSelectSlot,
    onNavigate,
    className = "",
    style,
    height = 600,
    selectable = false,
    popup = true,
    min,
    max,
    step = 30, // 기본 30분 간격
    timeslots = 2, // 기본 2개 슬롯 (30분 간격일 때 15분 단위)
    defaultView = "day",
    views = ["day"],
}: BigCalendarProps) {
    // 한국어 메시지 설정
    const messages = useMemo(
        () => ({
            next: "다음",
            previous: "이전",
            today: "오늘",
            month: "월",
            week: "주",
            day: "일",
            agenda: "일정",
            date: "날짜",
            time: "시간",
            event: "이벤트",
            noEventsInRange: "이 기간에 일정이 없습니다.",
            showMore: (total: number) => `+${total} 더 보기`,
        }),
        []
    );

    // 이벤트 ID 기반으로 일관된 랜덤 색상 생성
    const getEventColor = (eventId: string | number | undefined) => {
        if (!eventId) return "rgb(59 130 246)"; // 기본 파란색

        const colors = [
            "rgb(239 68 68)", // 빨간색
            "rgb(34 197 94)", // 초록색
            "rgb(59 130 246)", // 파란색
            "rgb(168 85 247)", // 보라색
            "rgb(249 115 22)", // 주황색
            "rgb(236 72 153)", // 핑크색
            "rgb(14 165 233)", // 하늘색
            "rgb(20 184 166)", // 청록색
            "rgb(234 179 8)", // 노란색
            "rgb(139 92 246)", // 인디고색
        ];

        // ID를 숫자로 변환하여 색상 인덱스 생성
        const idNum = typeof eventId === "string" ? parseInt(eventId) || 0 : eventId;
        return colors[Math.abs(idNum) % colors.length];
    };

    // 이벤트 스타일 생성 함수
    const eventPropGetter = (event: CalendarEvent) => {
        const backgroundColor = getEventColor(event.id);

        // 이벤트의 시간 간격 계산 (밀리초 단위)
        const durationInMs = event.endTime.getTime() - event.startTime.getTime();
        const durationInMinutes = durationInMs / (1000 * 60); // 분 단위 변환
        const durationInHours = durationInMs / (1000 * 60 * 60);

        let className = "";

        // 1시간 이상이면 'rbc-event-long-duration' className 추가
        if (durationInHours >= 1) {
            className = "rbc-event-long-duration";
        }
        // 30분 미만이면 'rbc-event-short' className 추가 (짧은 일정 스타일)
        else if (durationInMinutes < 30) {
            className = "rbc-event-short";
        }

        return {
            style: {
                backgroundColor,
                borderColor: backgroundColor,
                color: "white",
            },
            className,
        };
    };

    // events에서 가장 이른 시간 찾기
    const calculatedMin = useMemo(() => {
        if (min) return min; // prop으로 전달된 min이 있으면 우선 사용

        // events의 start 시간 중 가장 이른 시간 찾기
        const earliestStart = events.reduce((earliest, event) => {
            const eventStart = dayjs(event.startTime);
            return eventStart.isBefore(earliest) ? eventStart : earliest;
        }, dayjs(events[0]?.startTime));

        // 가장 이른 시간의 시작 시간으로 설정 (예: 09:30 -> 09:00, 분을 00분으로 고정)
        return earliestStart.startOf("hour").toDate();
    }, [events, min]);

    return (
        <>
            <style jsx global>
                {`
                    .rbc-calendar {
                        border-radius: 0.5rem !important;
                        border: 1px solid rgb(229 231 235) !important;
                        background-color: white !important;
                        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
                    }
                    .rbc-time-view {
                        border: 0 !important;
                    }
                    .rbc-time-header {
                        border-bottom: 1px solid rgb(229 231 235) !important;
                    }
                    .rbc-time-header-content {
                        border-left: 0 !important;
                    }
                    .rbc-header {
                        border-bottom: 1px solid rgb(229 231 235) !important;
                        background-color: rgb(249 250 251) !important;
                        padding: 0.5rem 0 !important;
                        font-size: 0.875rem !important;
                        font-weight: 500 !important;
                        color: rgb(55 65 81) !important;
                    }
                    .rbc-label {
                        font-size: 0.75rem !important;
                        font-weight: 500 !important;
                        color: rgb(75 85 99) !important;
                    }
                    .rbc-time-content {
                        border-top: 0 !important;
                    }
                    .rbc-time-slot {
                        border-top: 1px solid rgb(243 244 246) !important;
                    }
                    .rbc-day-slot {
                        border-right: 1px solid rgb(243 244 246) !important;
                    }
                    .rbc-time-slot-selected {
                        background-color: rgb(239 246 255) !important;
                    }
                    .rbc-event {
                        border-radius: 0.375rem !important;
                        border: 0 !important;
                        padding: 0.25rem 0.5rem !important;
                        font-size: 0.75rem !important;
                        font-weight: 500 !important;
                        color: white !important;
                        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
                        transition: all 0.2s !important;
                    }
                    .rbc-event-label {
                        font-weight: 500 !important;
                        color: white !important;
                    }

                    /* 1시간 이상인 이벤트의 폰트 크기 증가 */
                    .rbc-event-long-duration .rbc-event-label {
                        font-size: 1.1rem !important;
                    }

                    .rbc-event-long-duration .rbc-event-content {
                        font-size: 1.1rem !important;
                    }
                    .rbc-event-long-duration {
                        /* 라이브러리가 겹침으로 판단해도 너비를 강제로 100%로 유지 */
                        width: 100% !important;
                        left: 0 !important;
                        z-index: 10 !important;
                    }

                    /* 30분 미만 짧은 이벤트 스타일 최적화 */
                    .rbc-event-short {
                        padding: 0px 4px !important; /* 패딩 제거 */
                        display: flex !important;
                        align-items: center !important; /* 텍스트 수직 중앙 정렬 */
                        line-height: 1 !important; /* 줄 간격 최소화 */
                        overflow: hidden !important; /* 넘치는 내용 숨김 */
                        min-height: auto !important; /* 최소 높이 제한 해제 시도 */

                        /* 라이브러리가 겹침으로 판단해도 너비를 강제로 100%로 유지 */
                        width: 100% !important;
                        left: 0 !important;
                        z-index: 10 !important;
                    }
                    .rbc-event-short .rbc-event-label {
                        font-size: 0.7rem !important; /* 폰트 크기 축소 */
                        white-space: nowrap !important; /* 줄바꿈 방지 */
                        margin-right: 4px !important;
                    }
                    .rbc-event-short .rbc-event-content {
                        font-size: 0.7rem !important;
                        white-space: nowrap !important;
                    }
                `}
            </style>
            <div className={`rbc-calendar ${className}`} style={style}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor={(event) => event.startTime}
                    endAccessor={(event) => event.endTime}
                    defaultDate={defaultDate}
                    defaultView={defaultView}
                    views={views}
                    onSelectEvent={onSelectEvent}
                    onSelectSlot={onSelectSlot}
                    onNavigate={onNavigate}
                    messages={messages}
                    style={{ height, width: "100%" }}
                    selectable={selectable}
                    // popup={popup}
                    toolbar={false}
                    culture="ko"
                    min={calculatedMin}
                    step={step}
                    timeslots={timeslots}
                    eventPropGetter={eventPropGetter}
                />
            </div>
        </>
    );
}
