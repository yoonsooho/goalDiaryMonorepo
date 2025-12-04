import { useMutation, useQuery } from "@tanstack/react-query";
import { getAccessTokenFromCookie } from "@/lib/utils";
import { getSchedules, postSchedules, deleteSchedules, updateSchedules } from "@/api/schedulesApi";
import { PostSchedulesType } from "@/type/ScheduleType";

export const useGetSchedules = () => {
    return useQuery({
        queryKey: ["schedules"], // 토큰을 쿼리 키에 포함
        queryFn: getSchedules,
    });
};
export const usePostSchedules = () => {
    return useMutation({
        mutationFn: (data: PostSchedulesType) => {
            return postSchedules(data);
        },
    });
};
export const useUpdateSchedules = () => {
    return useMutation({
        mutationFn: (data: PostSchedulesType & { id: string }) => {
            return updateSchedules(data);
        },
    });
};
export const useDeleteSchedules = () => {
    return useMutation({
        mutationFn: (id: string) => {
            return deleteSchedules(id);
        },
    });
};
