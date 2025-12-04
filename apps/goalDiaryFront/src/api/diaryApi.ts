import { DiaryTimeFormData } from "@/app/components/diary/type";
import { commonApiJson } from "./commonApi";

export const getDiary = async () => {
    return await commonApiJson("/api/diary", {
        method: "GET",
        requireAuth: true,
    });
};

export const getDiaryById = async (id: number) => {
    return await commonApiJson(`/api/diary/${id}`, {
        method: "GET",
        requireAuth: true,
    });
};
export const postDiary = async (data: DiaryTimeFormData) => {
    return await commonApiJson("/api/diary", {
        method: "POST",
        body: data,
        requireAuth: true,
    });
};

export const updateDiary = async (id: number, data: DiaryTimeFormData) => {
    return await commonApiJson(`/api/diary/${id}`, {
        method: "PATCH",
        body: data,
        requireAuth: true,
    });
};

export const deleteDiary = async (id: number) => {
    return await commonApiJson(`/api/diary/${id}`, {
        method: "DELETE",
        requireAuth: true,
    });
};
