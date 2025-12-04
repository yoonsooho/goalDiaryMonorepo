"use client";

import { useState, useEffect } from "react";
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
import { RoutineType, CreateRoutineDto } from "@/type/RoutineType";

interface UpdateRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<CreateRoutineDto>) => Promise<void>;
    routine: RoutineType | null;
}

export default function UpdateRoutineModal({ isOpen, onClose, onSubmit, routine }: UpdateRoutineModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
    } = useForm<Partial<Omit<RoutineType, "category"> & { category: string }>>();

    // 루틴 데이터가 변경될 때 폼 초기화
    useEffect(() => {
        if (routine) {
            setValue("title", routine.title);
            setValue("description", routine.description || "");
            setValue("category", routine.category?.join(",") || "");
            setValue("schedule_date", routine.schedule_date || "");
            setValue("time", routine.time || "");
            setValue("duration", routine.duration || undefined);
            setValue("isActive", routine.isActive);
        }
    }, [routine, setValue, isOpen]);

    const handleFormSubmit = async (data: Partial<Omit<RoutineType, "category"> & { category: string }>) => {
        try {
            setIsLoading(true);
            await onSubmit({
                ...data,
                category: data.category?.split(",") || [],
            });
            reset(); // 폼 초기화
            onClose(); // 모달 닫기
        } catch (error) {
            console.error("루틴 수정 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset(); // 폼 초기화
        onClose();
    };

    if (!routine) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>루틴 수정</DialogTitle>
                    <DialogDescription>루틴 정보를 수정해주세요.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">제목 *</Label>
                        <Input
                            id="title"
                            {...register("title", {
                                required: "제목을 입력해주세요",
                                maxLength: {
                                    value: 255,
                                    message: "제목은 255자 이하로 입력해주세요",
                                },
                            })}
                            placeholder="루틴 제목을 입력하세요"
                            disabled={isLoading}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">설명</Label>
                        <Input
                            id="description"
                            {...register("description")}
                            placeholder="루틴 설명을 입력하세요"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">카테고리</Label>
                        <Input
                            id="category"
                            {...register("category", {
                                setValueAs: (value) => {
                                    if (!value) return [];
                                    return value;
                                },
                                validate: (value) => {
                                    if (value && value.length > 200) {
                                        return "모든 카테고리 합계는 200자 이하로 입력해주세요";
                                    }
                                    return true;
                                },
                            })}
                            placeholder="예: 운동, 공부, 건강 (쉼표로 구분)"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">쉼표(,)로 구분하여 여러 카테고리를 입력하세요</p>
                        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="schedule_date">최초 시작 날짜</Label>
                        <Input id="schedule_date" type="date" {...register("schedule_date")} disabled={isLoading} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">시작 시간</Label>
                        <Input id="time" type="time" {...register("time")} disabled={isLoading} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">소요 시간 (분)</Label>
                        <Input
                            id="duration"
                            type="number"
                            min="1"
                            {...register("duration", {
                                valueAsNumber: true,
                                min: {
                                    value: 1,
                                    message: "소요 시간은 1분 이상이어야 합니다",
                                },
                            })}
                            placeholder="예: 30"
                            disabled={isLoading}
                        />
                        {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="isActive"
                            type="checkbox"
                            {...register("isActive")}
                            className="rounded border-gray-300"
                            disabled={isLoading}
                        />
                        <Label htmlFor="isActive">활성 상태</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <ButtonLoading /> : "수정"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
