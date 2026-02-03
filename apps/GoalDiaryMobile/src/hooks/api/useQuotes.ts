import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

export function useGetQuotes() {
    return useQuery({
        queryKey: ['quotes'],
        queryFn: async () => {
            const response = await apiClient.get('/quotes');
            return response.data;
        },
    });
}

export function useCreateQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/quotes', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
    });
}
