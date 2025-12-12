"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ButtonLoading } from "@/components/ui/loading";
import { useGetMyInvitations, useUpdateInvitationStatus } from "@/app/hooks/apiHook/useTeams";
import { Users, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TeamInvitationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TeamInvitationsModal({ isOpen, onClose }: TeamInvitationsModalProps) {
    const { data: invitations, isLoading } = useGetMyInvitations();
    const { mutate: updateStatus, isPending } = useUpdateInvitationStatus();

    const handleAccept = (membershipId: number, teamName: string) => {
        updateStatus(
            { membershipId, status: "ACTIVE" },
            {
                onSuccess: () => {
                    toast({
                        title: "초대 수락 완료",
                        description: `"${teamName}" 팀에 가입되었습니다.`,
                        variant: "default",
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "초대 수락 실패",
                        description: error.message || "초대 수락에 실패했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleReject = (membershipId: number, teamName: string) => {
        updateStatus(
            { membershipId, status: "REJECTED" },
            {
                onSuccess: () => {
                    toast({
                        title: "초대 거절 완료",
                        description: `"${teamName}" 팀 초대를 거절했습니다.`,
                        variant: "default",
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "초대 거절 실패",
                        description: error.message || "초대 거절에 실패했습니다.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>팀 초대 알림</DialogTitle>
                    <DialogDescription>
                        받은 팀 초대를 확인하고 수락 또는 거절할 수 있습니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <ButtonLoading />
                            <p className="text-sm text-gray-500 mt-2">초대 목록을 불러오는 중...</p>
                        </div>
                    ) : !invitations || invitations.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">받은 초대가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invitations.map((invitation: any) => (
                                <div
                                    key={invitation.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-semibold text-gray-900">
                                                    {invitation.team?.name || "알 수 없는 팀"}
                                                </h3>
                                            </div>
                                            {invitation.team?.owner && (
                                                <p className="text-sm text-gray-500">
                                                    팀장: {invitation.team.owner.username}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAccept(invitation.id, invitation.team?.name)}
                                                disabled={isPending}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                수락
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReject(invitation.id, invitation.team?.name)}
                                                disabled={isPending}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                거절
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

