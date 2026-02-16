"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { usePostSchedules } from "@/app/hooks/apiHook/useSchedules";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

type Props = {
    onOpenFullModal?: () => void;
};

export default function QuickAddSchedule({ onOpenFullModal }: Props) {
    const [value, setValue] = useState("");
    const { mutate: postSchedules, isPending } = usePostSchedules();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const today = dayjs().format("YYYY-MM-DD");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const title = value.trim();
        if (!title) return;

        postSchedules(
            { title, startDate: today, endDate: today },
            {
                onSuccess: () => {
                    setValue("");
                    queryClient.invalidateQueries({ queryKey: ["schedules"] });
                    toast({
                        title: "일정이 추가되었어요",
                        description: `"${title}"`,
                    });
                },
                onError: () => {
                    toast({
                        title: "추가에 실패했어요",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
            <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
                <span className="pl-3 text-gray-400" aria-hidden>
                    <Plus className="h-5 w-5" />
                </span>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="할 일을 입력하고 엔터"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 py-3"
                    disabled={isPending}
                    aria-label="할 일 입력 후 엔터로 추가"
                />
            </div>
            {onOpenFullModal && (
                <button
                    type="button"
                    onClick={onOpenFullModal}
                    className="mt-2 text-xs text-gray-500 hover:text-blue-600 hover:underline"
                >
                    날짜·기간을 지정해서 만들고 싶다면 클릭
                </button>
            )}
        </form>
    );
}
