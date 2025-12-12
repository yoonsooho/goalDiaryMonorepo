"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ButtonLoading } from "@/components/ui/loading";
import { useSearchUsers } from "@/app/hooks/apiHook/useUsers";
import { User } from "lucide-react";

interface InviteTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userId: string) => Promise<void>;
    teamId: number;
}

export default function InviteTeamMemberModal({
    isOpen,
    onClose,
    onSubmit,
    teamId,
}: InviteTeamMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setSelectedUserId(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedUserId) return;
        try {
            setIsSubmitting(true);
            await onSubmit(selectedUserId);
            setSearchQuery("");
            setSelectedUserId(null);
            onClose();
        } catch (error) {
            console.error("팀 초대 실패:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>팀 멤버 초대</DialogTitle>
                    <DialogDescription>
                        사용자 ID나 이름으로 검색하여 팀에 초대할 멤버를 선택하세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="search">사용자 검색</Label>
                        <Input
                            id="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="사용자 ID 또는 이름 입력"
                            disabled={isSubmitting}
                        />
                    </div>

                    {isSearching && (
                        <div className="text-sm text-gray-500 text-center py-4">검색 중...</div>
                    )}

                    {searchQuery && !isSearching && searchResults && (
                        <div className="border rounded-lg max-h-60 overflow-y-auto">
                            {searchResults.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    검색 결과가 없습니다.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {searchResults.map((user: { id: string; userId: string; username: string }) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                                selectedUserId === user.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                                            }`}
                                            disabled={isSubmitting}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.username}</div>
                                                    <div className="text-sm text-gray-500">@{user.userId}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedUserId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-900">선택된 사용자:</div>
                            <div className="text-sm text-blue-700">
                                {searchResults?.find((u: { id: string }) => u.id === selectedUserId)?.username}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedUserId || isSubmitting}
                    >
                        {isSubmitting ? <ButtonLoading /> : "초대"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

