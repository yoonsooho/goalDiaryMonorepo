"use client";
import React, { useEffect, useState } from "react";
import TextEditor from "@/components/TextEditor";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import DiaryTimeModal from "@/app/components/diary/modal/diaryTimeModal";
import { DiaryTimeFormData } from "@/app/components/diary/type";
import dayjs from "dayjs";
import Link from "next/link";
import { useGetDiaryById, useUpdateDiary } from "@/app/hooks/apiHook/useDiary";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function DiaryDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { mutate: postDiary, isPending: isPosting } = useUpdateDiary(id);
    const { data: diary, isLoading } = useGetDiaryById(id);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        getValues,
        watch,
    } = useForm<DiaryTimeFormData>({
        resolver: zodResolver(
            z.object({
                date: z.string().min(1, "날짜를 입력해주세요"),
                time: z.string().min(1, "시간을 입력해주세요"),
                content: z
                    .string()
                    .max(10000, "내용은 최대 10000자 이하로 입력해주세요")
                    .refine((val) => val !== "<p><br></p>", {
                        message: "내용을 입력해주세요",
                    }),
            })
        ),
        defaultValues: {
            date: "",
            time: "",
            content: "<p><br></p>",
        },
    });

    const onSubmit = (data: any) => {
        postDiary(data, {
            onSuccess: async () => {
                toast({
                    title: "일기 수정 완료",
                    description: "일기 수정 완료",
                    variant: "default",
                });
                await queryClient.invalidateQueries({ queryKey: ["diary", id] });
                await queryClient.invalidateQueries({ queryKey: ["diary"] });
                router.push("/diary");
            },
            onError: async (error) => {
                toast({
                    title: "일기 수정 실패",
                    description: error.message,
                    variant: "destructive",
                });
                await queryClient.invalidateQueries({ queryKey: ["diary", id] });
                await queryClient.invalidateQueries({ queryKey: ["diary"] });
            },
        });
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (diary && diary.date && diary.time && diary.content) {
            setValue("date", diary?.date);
            setValue("time", diary?.time);
            setValue("content", diary?.content);
        }
    }, [diary, setValue]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col p-4 gap-4">
                <div className="flex justify-center relative">
                    <div className="flex flex-col gap-2">
                        <Link href="/diary" className="absolute left-0">
                            <Button type="button" variant="outline">
                                이전
                            </Button>
                        </Link>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setOpen(true)}>
                        {`${watch("date")} ${watch("time")}`}
                    </Button>
                </div>
                <div className="flex-1 min-h-[500px]">
                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                            <TextEditor value={field.value || "<p><br></p>"} setValue={field.onChange} height={500} />
                        )}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content?.message}</p>}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" variant="outline" disabled={isPosting}>
                        저장
                    </Button>
                </div>
            </form>
            <DiaryTimeModal open={open} onClose={handleClose} register={register} errors={errors} />
        </>
    );
}
