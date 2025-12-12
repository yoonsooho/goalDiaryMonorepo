import { commonApiJson } from "@/api/commonApi";

export const searchUsers = async (query: string) => {
    return await commonApiJson(`/api/users/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        requireAuth: true,
    });
};

