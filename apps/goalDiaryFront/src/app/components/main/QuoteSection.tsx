"use client";

import { useGetQuotes, useCreateQuote, useUpdateQuote, useDeleteQuote } from "@/app/hooks/apiHook/useQuotes";
import { QuoteType } from "@/type/quote";
import { useState } from "react";
import { Plus, Trash2, Edit2, Link as LinkIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/common/Textarea";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {isLoading
                ? Array(3)
                      .fill(null)
                      .map((_, i) => (
                          <div
                              key={i}
                              className="h-40 bg-gray-100 rounded-xl animate-pulse border border-gray-200"
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
                className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors bg-white/50 backdrop-blur-sm"
            >
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">명언 추가하기</span>
            </button>
        );
    }

    if (isEditing) {
        return (
            <div className="h-40 p-4 border border-blue-200 rounded-xl bg-white shadow-lg flex flex-col gap-2 relative">
                <TextArea
                    placeholder="명언을 입력하세요"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="flex-1 resize-none min-h-[50px] text-sm p-2"
                />
                <div className="flex gap-2">
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
                        <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={handleSubmit} className="h-7 px-3 text-xs">
                        <Save className="w-3 h-3 mr-1" />
                        저장
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-40 p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow relative group flex flex-col justify-between">
            <div>
                <p className="text-gray-800 font-medium text-sm line-clamp-3 leading-relaxed">
                    &ldquo;{quote!.content}&rdquo;
                </p>
            </div>
            <div className="flex items-end justify-between mt-2">
                <div className="flex flex-col gap-1 overflow-hidden">
                    {quote!.author && (
                        <span className="text-xs text-gray-500 font-medium truncate">- {quote!.author}</span>
                    )}
                    {quote!.link && (
                        <Link
                            href={quote!.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate max-w-[150px]"
                        >
                            <LinkIcon className="w-3 h-3" />
                            관련 링크
                        </Link>
                    )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-100"
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-50 text-red-500 hover:text-red-600"
                        onClick={() => onDelete(quote!.id)}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
