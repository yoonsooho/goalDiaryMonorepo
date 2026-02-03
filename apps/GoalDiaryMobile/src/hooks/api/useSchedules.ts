import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

export function useGetSchedules() {
    return useQuery({
        queryKey: ['schedules'],
        queryFn: async () => {
            const response = await apiClient.get('/schedules');
            return response.data;
        },
    });
}

export function useGetSchedule(id: number) {
    return useQuery({
        queryKey: ['schedules', id],
        queryFn: async () => {
            const response = await apiClient.get(`/schedules/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
}

export function useCreateSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/schedules', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        },
    });
}
