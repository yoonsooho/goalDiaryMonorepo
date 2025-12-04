// QueryClient 공통 설정
export const queryClientConfig = {
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
        },
    },
} as const;

// 서버용 설정 (retry 비활성화)
export const serverQueryClientConfig = {
    ...queryClientConfig,
    defaultOptions: {
        ...queryClientConfig.defaultOptions,
        queries: {
            ...queryClientConfig.defaultOptions.queries,
            retry: false, // 서버에서는 retry 비활성화
        },
    },
} as const;
