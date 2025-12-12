"use client";

import { useGetUser, useSignOut, useUserDelete } from "@/app/hooks/apiHook/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DropdownMenuDialog } from "@/components/dropDownMenu";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { Bell, Users } from "lucide-react";
import { useGetUnreadNotificationCount } from "@/app/hooks/apiHook/useNotifications";
import MyTeamsModal from "@/app/components/main/modal/MyTeamsModal";
import NotificationsModal from "@/app/components/main/modal/NotificationsModal";

export default function Header() {
    const [mounted, setMounted] = useState(false);
    const [isMyTeamsModalOpen, setIsMyTeamsModalOpen] = useState(false);
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { data: user, isLoading, error } = useGetUser();
    const signOutMutation = useSignOut();
    const userDeleteMutation = useUserDelete();
    const { openConfirm, ConfirmModal } = useConfirmModal();
    const { data: unreadCountData } = useGetUnreadNotificationCount();
    const unreadNotificationCount = unreadCountData?.count || 0;

    const handleUserDelete = () => {
        userDeleteMutation.mutate(undefined, {
            onSuccess: () => {
                router.push("/");
            },
            onError: (error) => {
                console.log("회원탈퇴 에러:", error);
            },
        });
    };
    const checkPathname = (checkPath: string) => {
        let firstPath = pathname.split("/")[1];
        let firstCheckPath = checkPath.split("/")[1];
        return firstPath === firstCheckPath;
    };

    const handleLogout = () => {
        signOutMutation.mutate();
    };

    const confirmWithdrawal = () => {
        openConfirm(
            () => {
                handleUserDelete();
            },
            {
                title: "정말 회원탈퇴하시겠습니까?",
                description: "회원탈퇴 하시면 모든 데이터가 삭제됩니다.",
                confirmText: "확인",
                cancelText: "취소",
                variant: "destructive",
            }
        );
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (error) {
        return (
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <Link href="/main">
                                <h1 className="text-xl font-semibold text-gray-900">Goal Diary</h1>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-red-500 text-sm">사용자 정보 로딩 실패</span>
                            <Button onClick={handleLogout} variant="outline" size="sm">
                                로그아웃
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <ConfirmModal />
            <MyTeamsModal isOpen={isMyTeamsModalOpen} onClose={() => setIsMyTeamsModalOpen(false)} />
            <NotificationsModal isOpen={isNotificationsModalOpen} onClose={() => setIsNotificationsModalOpen(false)} />
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-24">
                        <Link href="/main">
                            <h1 className="text-xl font-semibold text-gray-900">Goal Diary</h1>
                        </Link>
                        <div className="flex items-center space-x-1 bg-muted p-1 rounded-md">
                            <Link
                                href="/main"
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                                    checkPathname("/main")
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                }`}
                            >
                                메인
                            </Link>
                            <Link
                                href="/diary"
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                                    checkPathname("/diary")
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                }`}
                            >
                                일기
                            </Link>
                        </div>
                    </div>
                    {mounted && !isLoading && user && user.username && (
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsNotificationsModalOpen(true)}
                                className="relative"
                                title="알림"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium px-1">
                                        {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMyTeamsModalOpen(true)}
                                title="내가 속한 팀"
                            >
                                <Users className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center space-x-3">
                                <div className="flex flex-col text-right">
                                    <DropdownMenuDialog
                                        className="text-sm font-medium text-gray-900 cursor-pointer"
                                        title={`안녕하세요, ${user?.username} 님!`}
                                        dropdownItemsList={[
                                            { label: "로그아웃", onClick: handleLogout },
                                            { label: "회원탈퇴", onClick: confirmWithdrawal },
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                disabled={signOutMutation.isPending}
                            >
                                로그아웃
                            </Button>
                            <Button
                                onClick={handleUserDelete}
                                variant="outline"
                                size="sm"
                                disabled={userDeleteMutation.isPending}
                            >
                                회원탈퇴
                            </Button> */}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
