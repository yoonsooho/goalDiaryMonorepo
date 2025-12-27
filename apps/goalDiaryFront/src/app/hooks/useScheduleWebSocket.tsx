"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessTokenFromCookie } from "@/lib/utils";

/**
 * 스케줄 WebSocket 연결 훅
 * scheduleId로 room에 join하고, schedule.updated 이벤트를 수신하여 React Query 캐시를 갱신합니다.
 *
 * @param scheduleId - 연결할 스케줄 ID (null이면 연결하지 않음)
 * @param options - 연결 옵션 (enabled: false면 연결하지 않음)
 * @returns Socket 인스턴스 (현재는 사용하지 않지만, 필요시 수동으로 이벤트 emit 등에 사용 가능)
 */
export const useScheduleWebSocket = (scheduleId: number | null, options: { enabled: boolean }) => {
    const { enabled } = options;
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!scheduleId || !enabled) return;

        const token = getAccessTokenFromCookie();
        if (!token) {
            console.warn("WebSocket: No access token found");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        // Socket.IO 클라이언트 연결
        // namespace: '/schedules' (백엔드의 @WebSocketGateway({ namespace: '/schedules' })와 매칭)
        const socket = io(`${apiUrl}/schedules`, {
            // 방법 1: auth 옵션 사용 (현재 사용 중, 권장)
            // 백엔드에서 client.handshake.auth?.token으로 읽음
            auth: {
                token, // JWT 토큰을 auth에 포함하여 전송
                // 백엔드에서 이 토큰을 읽어서 JWT 검증:
                // - schedule.gateway.ts의 handleConnection() 메서드가 연결 시 호출됨
                // - extractToken() 메서드에서 handshake.auth?.token을 읽음
                // - 토큰이 없거나 유효하지 않으면 client.disconnect(true)로 연결 거부
            },

            // 방법 2: extraHeaders 사용 (Authorization 헤더에 직접 넣기)
            // 주의: 브라우저 환경에서는 CORS 정책 때문에 제한적일 수 있음
            // Node.js 환경에서는 잘 작동하지만, 브라우저에서는 서버가 CORS를 허용해야 함
            // extraHeaders: {
            //     Authorization: `Bearer ${token}`,
            // },
            // 백엔드에서 client.handshake.headers.authorization으로 읽음

            // 방법 3: query parameter 사용
            // query: {
            //     token: token,
            // },
            // 백엔드에서 client.handshake.query?.token으로 읽음

            transports: ["websocket", "polling"], // websocket 실패 시 polling으로 폴백
        });

        socketRef.current = socket;

        // ===== Socket.IO 내장 이벤트 (Socket.IO에서 정해진 이벤트) =====

        // "connect": Socket.IO에서 제공하는 내장 이벤트 (연결 성공 시 자동 발생)
        socket.on("connect", () => {
            console.log("WebSocket connected:", socket.id);
            // scheduleId로 room join
            // "joinSchedule": 백엔드와 약속한 커스텀 이벤트 (백엔드의 @SubscribeMessage('joinSchedule')와 매칭)
            socket.emit("joinSchedule", { scheduleId });
            console.log("Joined schedule room:", scheduleId);
        });

        // "disconnect": Socket.IO에서 제공하는 내장 이벤트 (연결 종료 시 자동 발생)
        socket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        // "connect_error": Socket.IO에서 제공하는 내장 이벤트 (연결 실패 시 자동 발생)
        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
        });

        // ===== 커스텀 이벤트 (백엔드와 약속한 이벤트) =====

        // "schedule.updated": 백엔드와 약속한 커스텀 이벤트
        // 백엔드에서 this.server.to(`schedule:${scheduleId}`).emit('schedule.updated', payload)로 전송
        socket.on("schedule.updated", (payload: { type: string; scheduleId: number }) => {
            console.log("Schedule updated via WebSocket:", payload);

            // 삭제 이벤트인 경우 스케줄 리스트만 갱신
            if (payload.type === "deleted") {
                queryClient.invalidateQueries({ queryKey: ["schedules"] });
                queryClient.refetchQueries({ queryKey: ["schedules"] });
                return;
            }

            // 생성/수정 이벤트인 경우 스케줄 리스트와 posts 모두 갱신
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            queryClient.invalidateQueries({ queryKey: ["posts", scheduleId] });
            // 즉시 refetch하여 실시간 동기화 보장
            queryClient.refetchQueries({ queryKey: ["posts", scheduleId] });
            queryClient.refetchQueries({ queryKey: ["schedules"] });
        });

        // cleanup: 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [scheduleId, queryClient, enabled]);

    // Socket 인스턴스를 반환 (현재는 사용하지 않지만, 필요시 수동으로 이벤트 emit 등에 사용 가능)
    // 예: const socket = useScheduleWebSocket(scheduleId); socket?.emit('customEvent', data);
    return socketRef.current;
};
