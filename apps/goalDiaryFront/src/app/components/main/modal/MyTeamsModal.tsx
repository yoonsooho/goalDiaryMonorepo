"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetMyTeams, useLeaveTeam, useDeleteTeam, useGetTeamMembers, useRemoveTeamMember } from "@/app/hooks/apiHook/useTeams";
import { PageLoading } from "@/components/ui/loading";
import { Users, LogOut, Trash2, ChevronDown, ChevronUp, UserX } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useConfirmModal } from "@/components/ui/confirm-modal";

interface MyTeamsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MyTeamsModal({ isOpen, onClose }: MyTeamsModalProps) {
    const { data: myTeams, isLoading } = useGetMyTeams();
    const leaveTeamMutation = useLeaveTeam();
    const deleteTeamMutation = useDeleteTeam();
    const removeMemberMutation = useRemoveTeamMember();
    const { openConfirm, ConfirmModal } = useConfirmModal();
    const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());

    const handleLeaveTeam = (teamId: number, teamName: string) => {
        openConfirm(
            () => {
                leaveTeamMutation.mutate(teamId, {
                    onSuccess: () => {
                        toast({
                            title: "팀 탈퇴 완료",
                            description: `${teamName} 팀에서 탈퇴했습니다.`,
                        });
                    },
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "팀 탈퇴에 실패했습니다.";
                        toast({
                            title: "팀 탈퇴 실패",
                            description: errorMessage,
                            variant: "destructive",
                        });
                    },
                });
            },
            {
                title: "팀 탈퇴",
                description: `정말 ${teamName} 팀에서 탈퇴하시겠습니까?`,
                confirmText: "탈퇴",
                cancelText: "취소",
                variant: "destructive",
            }
        );
    };

    const handleDeleteTeam = (teamId: number, teamName: string) => {
        openConfirm(
            () => {
                deleteTeamMutation.mutate(teamId, {
                    onSuccess: () => {
                        toast({
                            title: "팀 삭제 완료",
                            description: `${teamName} 팀이 삭제되었습니다.`,
                        });
                    },
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "팀 삭제에 실패했습니다.";
                        toast({
                            title: "팀 삭제 실패",
                            description: errorMessage,
                            variant: "destructive",
                        });
                    },
                });
            },
            {
                title: "팀 삭제",
                description: `정말 ${teamName} 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
                confirmText: "삭제",
                cancelText: "취소",
                variant: "destructive",
            }
        );
    };

    const toggleTeamExpanded = (teamId: number) => {
        setExpandedTeams((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(teamId)) {
                newSet.delete(teamId);
            } else {
                newSet.add(teamId);
            }
            return newSet;
        });
    };

    const handleRemoveMember = (teamId: number, userId: string, userName: string, teamName: string) => {
        openConfirm(
            () => {
                removeMemberMutation.mutate(
                    { teamId, userId },
                    {
                        onSuccess: () => {
                            toast({
                                title: "팀원 탈퇴 완료",
                                description: `${userName}님을 ${teamName} 팀에서 탈퇴시켰습니다.`,
                            });
                        },
                        onError: (error: any) => {
                            const errorMessage = error?.response?.data?.message || "팀원 탈퇴에 실패했습니다.";
                            toast({
                                title: "팀원 탈퇴 실패",
                                description: errorMessage,
                                variant: "destructive",
                            });
                        },
                    }
                );
            },
            {
                title: "팀원 탈퇴",
                description: `정말 ${userName}님을 ${teamName} 팀에서 탈퇴시키시겠습니까?`,
                confirmText: "탈퇴",
                cancelText: "취소",
                variant: "destructive",
            }
        );
    };

    return (
        <>
            <ConfirmModal />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            내가 속한 팀
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {isLoading ? (
                            <PageLoading text="팀 목록을 불러오는 중..." />
                        ) : myTeams && myTeams.length > 0 ? (
                            <div className="space-y-3">
                                {myTeams.map((membership: any) => {
                                    const isExpanded = expandedTeams.has(membership.team.id);
                                    return (
                                        <div
                                            key={membership.id}
                                            className="border border-gray-200 rounded-lg overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">{membership.team.name}</h3>
                                                        {membership.role === "OWNER" && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                                소유자
                                                            </span>
                                                        )}
                                                        {membership.role === "ADMIN" && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                                관리자
                                                            </span>
                                                        )}
                                                        {membership.role === "MEMBER" && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                                멤버
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        소유자: {membership.team.owner?.username || "알 수 없음"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleTeamExpanded(membership.team.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    {membership.role === "OWNER" ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteTeam(membership.team.id, membership.team.name)}
                                                            disabled={deleteTeamMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleLeaveTeam(membership.team.id, membership.team.name)}
                                                            disabled={leaveTeamMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <TeamMembersList 
                                                    teamId={membership.team.id} 
                                                    isOwner={membership.role === "OWNER"}
                                                    onRemoveMember={handleRemoveMember}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>속한 팀이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// 팀원 목록 컴포넌트
function TeamMembersList({ 
    teamId, 
    isOwner, 
    onRemoveMember 
}: { 
    teamId: number; 
    isOwner: boolean;
    onRemoveMember: (teamId: number, userId: string, userName: string, teamName: string) => void;
}) {
    const { data: members, isLoading } = useGetTeamMembers(teamId);
    const { data: myTeams } = useGetMyTeams();
    const team = myTeams?.find((t: any) => t.team.id === teamId);

    if (isLoading) {
        return (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">팀원 목록을 불러오는 중...</p>
            </div>
        );
    }

    if (!members || members.length === 0) {
        return (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">팀원이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">팀원 목록</h4>
            <div className="space-y-2">
                {members.map((member: any) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                    >
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-medium text-gray-900">
                                {member.user?.username || "알 수 없음"}
                            </span>
                            {member.role === "OWNER" && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                    소유자
                                </span>
                            )}
                            {member.role === "ADMIN" && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                    관리자
                                </span>
                            )}
                            {member.role === "MEMBER" && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                    멤버
                                </span>
                            )}
                        </div>
                        {isOwner && member.role !== "OWNER" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveMember(
                                    teamId, 
                                    member.user?.id || "", 
                                    member.user?.username || "알 수 없음",
                                    team?.team.name || ""
                                )}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <UserX className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

