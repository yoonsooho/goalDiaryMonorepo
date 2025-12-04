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
import { useSignUp } from "@/app/hooks/apiHook/useAuth";

const registerSchema = z
    .object({
        userId: z.string().min(2, "사용자 ID는 최소 2글자 이상이어야 합니다"),
        username: z.string().min(2, "사용자명은 최소 2글자 이상이어야 합니다"),
        password: z.string().min(6, "비밀번호는 최소 6글자 이상이어야 합니다"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "비밀번호가 일치하지 않습니다",
        path: ["confirmPassword"],
    });

// Zod 스키마에서 confirmPassword 제거
const registerSchemaWithoutConfirm = registerSchema.omit({ confirmPassword: true });

// 타입 추론
type RegisterFormData = z.infer<typeof registerSchemaWithoutConfirm>;
type RegisterWithConfirmFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const [error, setError] = useState<string>("");
    const { mutateAsync, isPending } = useSignUp();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterWithConfirmFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await mutateAsync({ userId: data.userId, username: data.username, password: data.password });
            onSwitchToLogin();
        } catch (err: any) {
            console.log("err", err);
            setError(err?.message || "회원가입에 실패했습니다.");
        }
    };

    return (
        <Card className="w-[400px]">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">회원가입</CardTitle>
                <CardDescription className="text-center">새 계정을 만드세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">사용자 ID</Label>
                        <Input id="userId" type="text" placeholder="사용자 ID를 입력하세요" {...register("userId")} />
                        {errors.userId && <p className="text-sm text-red-500">{errors.userId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">사용자명</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="사용자명을 입력하세요"
                            {...register("username")}
                        />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
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

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="비밀번호를 다시 입력하세요"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "회원가입 중..." : "회원가입"}
                    </Button>
                    {error && <div className="text-sm text-red-500 text-center">{error}</div>}
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        이미 계정이 있으신가요?{" "}
                        <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:underline">
                            로그인
                        </button>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
