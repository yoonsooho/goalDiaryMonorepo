import { commonApiJson } from "@/api/commonApi";

export const signIn = async (data: any) => {
    return await commonApiJson("/api/auth/signin", {
        method: "POST",
        body: data,
        requireAuth: false, // 로그인은 인증이 필요없음
        credentials: "include",
    });
};

export const signUp = async (data: any) => {
    return await commonApiJson("/api/auth/signup", {
        method: "POST",
        body: data,
        requireAuth: false, // 회원가입은 인증이 필요없음
        credentials: "include",
    });
};

export const getUser = async () => {
    return await commonApiJson("/api/users/me", {
        method: "GET",
        requireAuth: true, // 사용자 정보는 인증이 필요
        credentials: "include",
    });
};

export const signOut = async () => {
    return await commonApiJson("/api/auth/signout", {
        method: "POST",
        requireAuth: true, // 로그아웃은 인증이 필요
        credentials: "include",
    });
};

export const userDelete = async () => {
    return await commonApiJson("/api/users/me", {
        method: "DELETE",
        requireAuth: true, // 회원탈퇴는 인증이 필요
        credentials: "include",
    });
};
