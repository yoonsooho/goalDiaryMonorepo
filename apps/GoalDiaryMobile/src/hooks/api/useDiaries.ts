import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

export function useGetDiaries() {
    return useQuery({
        queryKey: ['diaries'],
        queryFn: async () => {
            const response = await apiClient.get('/diaries');
            return response.data;
        },
    });
}

export function useCreateDiary() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/diaries', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaries'] });
        },
    });
}
