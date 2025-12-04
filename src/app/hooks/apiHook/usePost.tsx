import { useMutation, useQuery } from "@tanstack/react-query";
import { deletePosts, getPosts, postPosts, updatePosts, updateSeqPosts } from "@/api/postApi";
import { PostPostsType } from "@/type/postPosts";
import { boards } from "@/type/boards";

export const useGetPosts = (scheduleId: number, initialData?: boards) => {
    return useQuery({
        queryKey: ["posts", scheduleId],
        enabled: !!scheduleId,
        queryFn: () => getPosts(scheduleId),
        initialData, // 서버에서 받은 posts 넣기
    });
};
export const usePostPosts = (id: number) => {
    return useMutation({
        mutationKey: ["posts", id],
        mutationFn: (data: PostPostsType) => {
            return postPosts(id, data);
        },
    });
};
export const useUpdatePosts = (scheduleId: number) => {
    return useMutation({
        mutationKey: ["posts", scheduleId],
        mutationFn: (data: PostPostsType) => {
            return updatePosts(scheduleId, data);
        },
    });
};
export const useUpdateSeqPosts = (scheduleId: number) => {
    return useMutation({
        mutationKey: ["posts", scheduleId],
        mutationFn: (data: { id: number; seq: number }[]) => {
            return updateSeqPosts(scheduleId, data);
        },
    });
};
export const useDeletePosts = () => {
    return useMutation({
        mutationKey: ["posts"],
        mutationFn: (postId: number) => {
            return deletePosts(postId);
        },
    });
};
