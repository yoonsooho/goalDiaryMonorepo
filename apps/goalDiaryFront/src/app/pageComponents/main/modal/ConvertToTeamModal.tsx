"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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

interface ConvertToTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (teamName: string) => Promise<void>;
}

export default function ConvertToTeamModal({ isOpen, onClose, onSubmit }: ConvertToTeamModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ teamName: string }>();

    const handleFormSubmit = async (data: { teamName: string }) => {
        try {
            setIsLoading(true);
            await onSubmit(data.teamName);
            reset();
            onClose();
        } catch (error) {
            console.error("팀으로 전환 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>팀으로 전환</DialogTitle>
                    <DialogDescription>
                        이 일정을 팀 일정으로 전환하시겠습니까? 팀 이름을 입력해주세요. (없으면 자동으로 생성됩니다)
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="teamName">팀 이름</Label>
                        <Input
                            id="teamName"
                            {...register("teamName", {
                                required: "팀 이름을 입력해주세요",
                            })}
                            placeholder="팀 이름을 입력하세요"
                            disabled={isLoading}
                        />
                        {errors.teamName && <p className="text-sm text-red-500">{errors.teamName.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <ButtonLoading /> : "전환"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
