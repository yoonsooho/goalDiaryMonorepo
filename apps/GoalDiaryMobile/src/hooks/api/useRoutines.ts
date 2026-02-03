import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

export function useGetRoutines() {
    return useQuery({
        queryKey: ['routines'],
        queryFn: async () => {
            const response = await apiClient.get('/routines');
            return response.data;
        },
    });
}

export function useCreateRoutine() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/routines', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
        },
    });
}
