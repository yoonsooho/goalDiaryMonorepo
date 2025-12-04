import { commonApiJson } from "@/api/commonApi";
import { PostSchedulesType } from "@/type/ScheduleType";

export const getSchedules = async () => {
    return await commonApiJson("/api/schedules", {
        method: "GET",
        requireAuth: true, // 일정 조회는 인증이 필요
    });
};

export const postSchedules = async (data: PostSchedulesType) => {
    return await commonApiJson("/api/schedules", {
        method: "POST",
        body: data,
        requireAuth: true, // 일정 생성은 인증이 필요
    });
};

export const deleteSchedules = async (id: string) => {
    return await commonApiJson(`/api/schedules/${id}`, {
        method: "DELETE",
        requireAuth: true, // 일정 삭제는 인증이 필요
    });
};

export const updateSchedules = async (data: PostSchedulesType & { id: string }) => {
    return await commonApiJson(`/api/schedules/${data.id}`, {
        method: "PATCH",
        body: { ...data, id: undefined },
        requireAuth: true, // 일정 수정은 인증이 필요
    });
};
