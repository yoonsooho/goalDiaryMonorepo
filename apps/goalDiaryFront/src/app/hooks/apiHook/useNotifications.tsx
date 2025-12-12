import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/api/notificationsApi";

export const useGetNotifications = (enabled: boolean = true) => {
    return useInfiniteQuery({
        queryKey: ["notifications"],
        // enabled: 쿼리를 실행할지 여부 (모달이 열렸을 때만 실행)
        enabled,

        // queryFn: 각 페이지를 가져오는 함수
        // pageParam: getNextPageParam이 반환한 값이 여기로 전달됨
        // - 첫 페이지: initialPageParam (0)이 pageParam으로 전달
        // - 두 번째 페이지: getNextPageParam이 반환한 값 (1)이 pageParam으로 전달
        // - 세 번째 페이지: getNextPageParam이 반환한 값 (2)이 pageParam으로 전달
        queryFn: ({ pageParam }) => {
            // pageParam이 그대로 API의 page 파라미터로 전달됨
            // 예: pageParam = 0 → /api/notifications?page=0&limit=10
            // 예: pageParam = 1 → /api/notifications?page=1&limit=10
            return getNotifications(pageParam as number, 10);
        },

        // getNextPageParam: 다음 페이지가 있는지 확인하고 다음 pageParam 값을 반환
        // - 반환한 값이 다음 queryFn의 pageParam으로 전달됨
        // - undefined를 반환하면 hasNextPage = false가 됨
        //
        // 파라미터 설명 (useInfiniteQuery에서 자동으로 제공):
        // - lastPage: 방금 가져온 페이지의 데이터 (가장 최근에 요청한 페이지)
        //   예: { notifications: [...], hasMore: true, total: 15 }
        // - allPages: 지금까지 가져온 모든 페이지들의 배열 (useInfiniteQuery가 자동으로 관리)
        //   예: 첫 페이지 요청 후 → [{ notifications: [...] }] (length = 1)
        //   예: 두 번째 페이지 요청 후 → [{ notifications: [...] }, { notifications: [...] }] (length = 2)
        //   allPages.length = 현재까지 가져온 페이지 수 = 다음 페이지 번호
        getNextPageParam: (lastPage, allPages) => {
            console.log("[useInfiniteQuery] getNextPageParam called:", {
                hasMore: lastPage?.hasMore,
                currentPagesCount: allPages.length, // 현재까지 가져온 페이지 수
                total: lastPage?.total,
            });

            // hasMore가 false이면 undefined 반환 (더 이상 페이지 없음)
            if (!lastPage?.hasMore) {
                return undefined; // hasNextPage = false
            }

            // 다음 페이지 번호 = 현재까지 가져온 페이지 수
            // - 첫 페이지 로드 후: allPages.length = 1 → 다음 pageParam = 1
            // - 두 번째 페이지 로드 후: allPages.length = 2 → 다음 pageParam = 2
            // 이 값이 다음 queryFn의 pageParam으로 전달됨
            const nextPage = allPages.length;
            console.log("[useInfiniteQuery] Returning next page:", nextPage, "→ This will be the next pageParam");
            return nextPage;
        },

        // initialPageParam: 첫 페이지의 pageParam 값
        // 첫 queryFn 호출 시 이 값이 pageParam으로 전달됨
        initialPageParam: 0,
    });
};

export const useGetUnreadNotificationCount = () => {
    return useQuery({
        queryKey: ["unreadNotificationCount"],
        queryFn: getUnreadNotificationCount,
        refetchInterval: 10000, // 10초마다 자동 갱신
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => {
            return markNotificationAsRead(notificationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => {
            return markAllNotificationsAsRead();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
        },
    });
};
