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
import { PostSchedulesType } from "@/type/ScheduleType";

interface CreateScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PostSchedulesType) => Promise<void>;
}

export default function CreateScheduleModal({ isOpen, onClose, onSubmit }: CreateScheduleModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PostSchedulesType>();

    const handleFormSubmit = async (data: PostSchedulesType) => {
        try {
            setIsLoading(true);
            await onSubmit(data);
            reset(); // 폼 초기화
            onClose(); // 모달 닫기
        } catch (error) {
            console.error("일정 생성 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset(); // 폼 초기화
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>새 일정 만들기</DialogTitle>
                    <DialogDescription>일정의 제목과 기간을 입력해주세요.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                            id="title"
                            {...register("title", {
                                required: "제목을 입력해주세요",
                            })}
                            placeholder="일정 제목을 입력하세요"
                            disabled={isLoading}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">시작 날짜</Label>
                        <Input
                            id="startDate"
                            type="date"
                            {...register("startDate", {
                                required: "시작 날짜를 선택해주세요",
                            })}
                            disabled={isLoading}
                        />
                        {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">종료 날짜</Label>
                        <Input id="endDate" type="date" {...register("endDate")} disabled={isLoading} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <ButtonLoading /> : "생성"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
