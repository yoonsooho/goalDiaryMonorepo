"use client";

import { useGetDiary, useDeleteDiary } from "@/app/hooks/apiHook/useDiary";
import { DiaryFormData } from "@/app/components/diary/type";
import Link from "next/link";
import { PageLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const DiaryList = () => {
    const { data: diaries, isLoading } = useGetDiary();
    const { openConfirm, ConfirmModal } = useConfirmModal();
    const queryClient = useQueryClient();
    const { mutate: deleteDiary } = useDeleteDiary();

    const handleDeleteDiary = (id: number) => {
        deleteDiary(id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["diary"] });
                toast({
                    title: "일기 삭제 완료",
                    description: "일기가 삭제되었습니다.",
                    variant: "destructive",
                });
            },
            onError: (error) => {
                toast({
                    title: "일기 삭제 실패",
                    description: error.message,
                    variant: "destructive",
                });
            },
        });
    };

    // HTML 태그 제거하고 텍스트만 추출하는 함수
    const stripHtml = (html: string) => {
        if (typeof window === "undefined") {
            // 서버 사이드에서는 정규식으로 간단히 처리
            return html
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .trim();
        }
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // 텍스트 미리보기 생성 (최대 100자)
    const getPreview = (content: string) => {
        const text = stripHtml(content);
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    };

    return (
        <>
            <ConfirmModal />
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full flex flex-col gap-4">
                    {isLoading ? (
                        <PageLoading text="일기를 로딩중입니다..." />
                    ) : diaries && diaries.length > 0 ? (
                        diaries.map((diary: DiaryFormData) => (
                            <Link
                                href={`/diary/${diary.id}`}
                                key={`${diary.date}-${diary.time}-${diary.id}`}
                                className="block group"
                            >
                                <div className="relative overflow-hidden border border-gray-200/60 p-6 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 hover:shadow-lg transition-all duration-300 flex justify-between items-center bg-white/80 backdrop-blur-sm">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-purple-700">날짜</span>
                                                <span className="text-sm text-purple-600 font-semibold">
                                                    {diary.date}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-full">
                                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-pink-700">시간</span>
                                                <span className="text-sm text-pink-600 font-semibold">
                                                    {diary.time}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-3">
                                            {getPreview(diary.content)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openConfirm(() => handleDeleteDiary(diary.id), {
                                                    title: "일기 삭제",
                                                    description: `${diary.date} ${diary.time} 일기를 정말 삭제하시겠습니까?`,
                                                    confirmText: "삭제",
                                                    cancelText: "취소",
                                                    variant: "destructive",
                                                });
                                            }}
                                            className="hover:bg-red-100 hover:text-red-600 rounded-full p-2"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <p className="text-gray-500 text-lg">작성된 일기가 없습니다.</p>
                            <p className="text-gray-400 text-sm mt-2">새 일기를 작성해보세요!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DiaryList;
