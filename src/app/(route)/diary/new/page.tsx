"use client";
import React, { useState } from "react";
import TextEditor from "@/components/TextEditor";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import DiaryTimeModal from "@/app/components/diary/modal/diaryTimeModal";
import { DiaryTimeFormData } from "@/app/components/diary/type";
import dayjs from "dayjs";
import Link from "next/link";
import { usePostDiary } from "@/app/hooks/apiHook/useDiary";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
const NewDiaryPage = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { mutate: postDiary, isPending: isPosting } = usePostDiary();
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        getValues,
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
            date: dayjs().format("YYYY-MM-DD"),
            time: dayjs().format("HH:mm"),
            content: "<p><br></p>",
        },
    });

    const onSubmit = (data: any) => {
        console.log(data);
        postDiary(data, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ["diary"] });
                toast({
                    title: "일기 저장 완료",
                    description: "일기가 저장되었습니다.",
                    variant: "default",
                });
                router.push("/diary");
            },
            onError: async (error) => {
                await queryClient.invalidateQueries({ queryKey: ["diary"] });
                toast({
                    title: "일기 저장 실패",
                    description: error.message,
                    variant: "destructive",
                });
            },
        });
    };

    const handleClose = () => {
        setOpen(false);
    };

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
                        {`${getValues("date")} ${getValues("time")}`}
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
};

export default NewDiaryPage;
