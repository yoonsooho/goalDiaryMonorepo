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

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/google";
    };

    return (
        <Card className="w-full max-w-[400px] mx-auto bg-transparent border-0 shadow-none p-0">
            <CardHeader className="space-y-1 px-0 pt-0">
                <CardTitle className="text-2xl text-center text-gray-900">로그인</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-0 pb-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">사용자 ID</Label>
                        <Input
                            id="userId"
                            type="text"
                            placeholder="사용자 ID를 입력하세요"
                            className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-400/50"
                            {...register("userId")}
                        />
                        {errors.userId && <p className="text-sm text-red-500">{errors.userId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-400/50"
                            {...register("password")}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    {error && <div className="text-sm text-red-500 text-center">{error}</div>}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        로그인
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200/80" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/80 px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
                    <svg
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                    >
                        <path
                            fill="currentColor"
                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        ></path>
                    </svg>
                    Google
                </Button>

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
