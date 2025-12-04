import { useMutation, useQuery } from "@tanstack/react-query";
import { getDiary, postDiary, deleteDiary, updateDiary, getDiaryById } from "@/api/diaryApi";
import { DiaryTimeFormData } from "@/app/components/diary/type";

export const useGetDiary = () => {
    return useQuery({
        queryKey: ["diary"],
        queryFn: () => getDiary(),
    });
};
export const useGetDiaryById = (id: number) => {
    return useQuery({
        queryKey: ["diary", id],
        queryFn: () => getDiaryById(id),
        enabled: !!id,
    });
};

export const usePostDiary = () => {
    return useMutation({
        mutationKey: ["diary"],
        mutationFn: (data: DiaryTimeFormData) => {
            return postDiary(data);
        },
    });
};
export const useUpdateDiary = (id: number) => {
    return useMutation({
        mutationKey: ["updateDiary", id],
        mutationFn: (data: DiaryTimeFormData) => {
            return updateDiary(id, data);
        },
    });
};

export const useDeleteDiary = () => {
    return useMutation({
        mutationKey: ["diary"],
        mutationFn: (id: number) => {
            return deleteDiary(id);
        },
    });
};
