import { commonApiJson } from "@/api/commonApi";

export const getNotifications = async (page: number = 0, limit: number = 20) => {
    return await commonApiJson(`/api/notifications?page=${page}&limit=${limit}`, {
        method: "GET",
        requireAuth: true,
    });
};

export const getUnreadNotificationCount = async () => {
    return await commonApiJson("/api/notifications/unread-count", {
        method: "GET",
        requireAuth: true,
    });
};

export const markNotificationAsRead = async (notificationId: number) => {
    return await commonApiJson(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        requireAuth: true,
    });
};

export const markAllNotificationsAsRead = async () => {
    return await commonApiJson("/api/notifications/read-all", {
        method: "PATCH",
        requireAuth: true,
    });
};

