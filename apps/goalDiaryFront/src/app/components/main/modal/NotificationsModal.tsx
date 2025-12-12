"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    useGetNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
} from "@/app/hooks/apiHook/useNotifications";
import { useUpdateInvitationStatus, useGetMyInvitations } from "@/app/hooks/apiHook/useTeams";
import { PageLoading } from "@/components/ui/loading";
import { Bell, Check, CheckCheck, Users, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMemo, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const queryClient = useQueryClient();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications(isOpen); // 모달이 열렸을 때만 쿼리 실행
    const { data: invitations } = useGetMyInvitations();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const updateInvitationStatusMutation = useUpdateInvitationStatus();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null); // 마지막 2번째 요소를 감시할 ref

    // 모든 페이지의 알람을 하나의 배열로 합치기
    const notifications = useMemo(() => {
        if (!data?.pages) return [];
        const allNotifications = data.pages.flatMap((page: any) => page.notifications || []);

        return allNotifications;
    }, [data]);

    // PENDING 상태인 초대의 membershipId Set 생성
    const pendingInvitationIds = useMemo(() => {
        if (!invitations) return new Set<number>();
        return new Set(invitations.map((inv: any) => inv.id));
    }, [invitations]);

    const handleMarkAsRead = (notificationId: number) => {
        markAsReadMutation.mutate(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate(undefined, {
            onSuccess: () => {
                // 성공 시 아무것도 하지 않음 (자동으로 갱신됨)
            },
        });
    };

    const handleAcceptInvitation = (notification: any) => {
        if (!notification.metadata?.membershipId) return;

        updateInvitationStatusMutation.mutate(
            { membershipId: notification.metadata.membershipId, status: "ACTIVE" },
            {
                onSuccess: () => {
                    handleMarkAsRead(notification.id);
                    // 알람 목록과 초대 목록 갱신
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
                    toast({
                        title: "초대 수락 완료",
                        description: `"${notification.metadata.teamName}" 팀에 가입되었습니다.`,
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "초대 수락 실패",
                        description: error?.response?.data?.message || "초대 수락에 실패했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleRejectInvitation = (notification: any) => {
        if (!notification.metadata?.membershipId) return;

        updateInvitationStatusMutation.mutate(
            { membershipId: notification.metadata.membershipId, status: "REJECTED" },
            {
                onSuccess: () => {
                    handleMarkAsRead(notification.id);
                    // 알람 목록과 초대 목록 갱신
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
                    toast({
                        title: "초대 거절 완료",
                        description: `"${notification.metadata.teamName}" 팀 초대를 거절했습니다.`,
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "초대 거절 실패",
                        description: error?.response?.data?.message || "초대 거절에 실패했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

    // Intersection Observer로 마지막 2번째 요소가 보이면 다음 페이지 로드
    useEffect(() => {
        if (!isOpen || !loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

        const loadMoreElement = loadMoreRef.current; // cleanup 함수에서 사용하기 위해 변수에 저장

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );

        observer.observe(loadMoreElement);

        return () => {
            if (loadMoreElement) {
                observer.unobserve(loadMoreElement);
            }
        };
    }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage, notifications.length]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[600px] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            알림
                        </DialogTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                                className="text-sm"
                            >
                                <CheckCheck className="w-4 h-4 mr-1" />
                                모두 읽음
                            </Button>
                        )}
                    </div>
                </DialogHeader>
                <div ref={scrollContainerRef} className="mt-4 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <PageLoading text="알림을 불러오는 중..." />
                    ) : notifications && notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((notification: any, index: number) => {
                                const isTeamInvitation = notification.type === "TEAM_INVITATION";
                                const isRead = notification.isRead;
                                // 팀 초대 알람의 경우, membershipId가 PENDING 상태인지 확인
                                const isInvitationPending =
                                    isTeamInvitation &&
                                    notification.metadata?.membershipId &&
                                    pendingInvitationIds.has(notification.metadata.membershipId);

                                // 마지막 2번째 요소에 ref 할당
                                const isLastSecond = index === notifications.length - 2;

                                return (
                                    <div
                                        key={notification.id}
                                        ref={isLastSecond ? loadMoreRef : null}
                                        className={`p-3 rounded-lg border transition-colors ${
                                            isRead
                                                ? "bg-white border-gray-200"
                                                : isTeamInvitation
                                                  ? "bg-purple-50 border-purple-200"
                                                  : "bg-blue-50 border-blue-200"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                {isTeamInvitation && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Users className="w-4 h-4 text-purple-600" />
                                                        <span className="text-xs font-medium text-purple-700">
                                                            팀 초대
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.message}
                                                </p>
                                                {isTeamInvitation && notification.metadata?.ownerUsername && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        팀장: {notification.metadata.ownerUsername}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString("ko-KR", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {isTeamInvitation && isInvitationPending && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAcceptInvitation(notification)}
                                                            disabled={updateInvitationStatusMutation.isPending}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRejectInvitation(notification)}
                                                            disabled={updateInvitationStatusMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {!isRead && !isTeamInvitation && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={markAsReadMutation.isPending}
                                                        className="shrink-0"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {isFetchingNextPage && (
                                <div className="text-center py-4 text-gray-500">
                                    <PageLoading text="더 많은 알림을 불러오는 중..." />
                                </div>
                            )}
                            {!hasNextPage && notifications.length > 0 && (
                                <div className="text-center py-4 text-gray-400 text-sm">모든 알림을 불러왔습니다.</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>알림이 없습니다.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
