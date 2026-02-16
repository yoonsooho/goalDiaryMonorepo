"use client";

import { useGetQuotes, useCreateQuote, useUpdateQuote, useDeleteQuote } from "@/app/hooks/apiHook/useQuotes";
import { QuoteType } from "@/type/quote";
import { useState } from "react";
import { Plus, Trash2, Edit2, Link as LinkIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextArea from "@/components/common/TextArea";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function QuoteSection() {
    const { data: quotes = [], isLoading } = useGetQuotes();
    const { mutate: createQuote } = useCreateQuote();
    const { mutate: updateQuote } = useUpdateQuote();
    const { mutate: deleteQuote } = useDeleteQuote();
    const queryClient = useQueryClient();
    // 3개의 슬롯을 만들기 위해 빈 배열을 채움 (최대 3개)
    const slots = Array(3)
        .fill(null)
        .map((_, i) => quotes[i] || null);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {isLoading
                ? Array(3)
                      .fill(null)
                      .map((_, i) => (
                          <div
                              key={i}
                              className="h-32 sm:h-40 bg-gray-100 rounded-xl animate-pulse border border-gray-200"
                          ></div>
                      ))
                : slots.map((quote, index) => (
                      <QuoteCard
                          key={quote?.id || `empty-${index}`}
                          quote={quote}
                          onCreate={(data) => {
                              createQuote(data, {
                                  onSuccess: () => {
                                      toast({ title: "명언이 추가되었습니다." });
                                  },
                                  onError: (error: any) => {
                                      toast({
                                          title: "추가 실패",
                                          description: error.message,
                                          variant: "destructive",
                                      });
                                  },
                              });
                          }}
                          onUpdate={(id, data) => {
                              updateQuote(
                                  { id, data },
                                  {
                                      onSuccess: () => {
                                          toast({ title: "명언이 수정되었습니다." });
                                      },
                                  }
                              );
                          }}
                          onDelete={(id) => {
                              deleteQuote(id, {
                                  onSuccess: () => {
                                      queryClient.invalidateQueries({ queryKey: ["quotes"] });
                                      toast({ title: "명언이 삭제되었습니다." });
                                  },
                                  onError: (error: any) => {
                                      toast({
                                          title: "삭제 실패",
                                          description: error.message,
                                          variant: "destructive",
                                      });
                                  },
                              });
                          }}
                      />
                  ))}
        </div>
    );
}

function QuoteCard({
    quote,
    onCreate,
    onUpdate,
    onDelete,
}: {
    quote: QuoteType | null;
    onCreate: (data: any) => void;
    onUpdate: (id: number, data: any) => void;
    onDelete: (id: number) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [form, setForm] = useState({
        content: quote?.content || "",
        author: quote?.author || "",
        link: quote?.link || "",
    });

    // quote가 변경될 때 form 상태 업데이트 (수정 모드 취소 시 등)
    if (
        !isEditing &&
        quote &&
        (form.content !== quote.content || form.author !== quote.author || form.link !== quote.link)
    ) {
        setForm({
            content: quote.content,
            author: quote.author || "",
            link: quote.link || "",
        });
        setIsExpanded(false); // quote 변경 시 확장 상태 초기화
    }

    const handleSubmit = () => {
        if (!form.content.trim()) return;

        if (quote) {
            onUpdate(quote.id, form);
            setIsEditing(false);
        } else {
            onCreate(form);
            // 생성 후 초기화는 상위 컴포넌트 리렌더링에 맡김 (또는 여기서 초기화)
            setForm({ content: "", author: "", link: "" });
            setIsEditing(false); // 생성 모드 종료
        }
    };

    if (!quote && !isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="h-48 sm:h-60 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-white/50 backdrop-blur-sm p-4"
            >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                <span className="text-xs sm:text-sm font-medium">명언 추가하기</span>
            </button>
        );
    }

    if (isEditing) {
        return (
            <div className="min-h-[160px] sm:h-40 p-3 sm:p-4 border border-blue-200 rounded-xl bg-white shadow-lg flex flex-col gap-2 relative">
                <TextArea
                    placeholder="명언을 입력하세요"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="flex-1 resize-none min-h-[50px] text-xs sm:text-sm p-2"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        placeholder="저자"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        className="h-8 text-xs flex-1"
                    />
                    <Input
                        placeholder="링크 (선택)"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        className="h-8 text-xs flex-1"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-auto">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setIsEditing(false);
                            if (!quote) setForm({ content: "", author: "", link: "" });
                        }}
                        className="h-7 w-7 p-0"
                    >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button size="sm" onClick={handleSubmit} className="h-7 px-2 sm:px-3 text-xs">
                        <Save className="w-3 h-3 mr-1" />
                        저장
                    </Button>
                </div>
            </div>
        );
    }

    // 텍스트가 길거나 줄바꿈이 많으면 "더 보기" 버튼 표시
    // 5줄 이상이거나, 80자 이상이면 버튼 표시
    const lineCount = quote!.content.split("\n").length;
    const shouldShowExpand = lineCount > 5 || quote!.content.length > 80;
    const displayContent = isExpanded ? quote!.content : quote!.content;

    return (
        <div
            className={`${isExpanded ? "h-auto min-h-[160px]" : ""} p-4 sm:p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow relative group flex flex-col justify-between`}
        >
            <div>
                <p
                    className={`text-gray-800 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${!isExpanded ? "line-clamp-5" : ""}`}
                >
                    &ldquo;{displayContent}&rdquo;
                </p>
                {shouldShowExpand && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="mt-1 text-[10px] sm:text-xs text-blue-500 hover:text-blue-600 hover:underline"
                    >
                        {isExpanded ? "접기" : "더 보기"}
                    </button>
                )}
            </div>
            <div className="flex items-end justify-between mt-2 gap-2">
                <div className="flex flex-col gap-1 overflow-hidden flex-1 min-w-0">
                    {quote!.author && (
                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">- {quote!.author}</span>
                    )}
                    {quote!.link && (
                        <Link
                            href={quote!.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] sm:text-xs text-blue-500 hover:underline flex items-center gap-1 truncate max-w-[120px] sm:max-w-[150px]"
                        >
                            <LinkIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                            <span className="truncate">관련 링크</span>
                        </Link>
                    )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-gray-100"
                        onClick={() => {
                            setIsEditing(true);
                            setIsExpanded(false);
                        }}
                    >
                        <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-red-50 text-red-500 hover:text-red-600"
                        onClick={() => onDelete(quote!.id)}
                    >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
