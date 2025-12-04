"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUser, useSignIn, useSignOut } from "@/app/hooks/apiHook/useAuth";

const loginSchema = z.object({
    userId: z.string().min(1, "사용자 ID를 입력해주세요"),
    password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const [error, setError] = useState<string>("");
    const { mutateAsync, isPending } = useSignIn();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await mutateAsync(data);
        } catch (err: any) {
            setError(err?.message || "로그인에 실패했습니다.");
        }
    };

    return (
        <Card className="w-[400px] p-4">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">로그인</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">사용자 ID</Label>
                        <Input id="userId" type="text" placeholder="사용자 ID를 입력하세요" {...register("userId")} />
                        {errors.userId && <p className="text-sm text-red-500">{errors.userId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            {...register("password")}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    {error && <div className="text-sm text-red-500 text-center">{error}</div>}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        로그인
                    </Button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        계정이 없으신가요?{" "}
                        <button type="button" onClick={onSwitchToRegister} className="text-blue-600 hover:underline">
                            회원가입
                        </button>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
