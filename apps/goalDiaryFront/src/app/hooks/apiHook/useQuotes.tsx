import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuotes, createQuote, updateQuote, deleteQuote } from "@/api/quotesApi";
import { CreateQuoteDto, UpdateQuoteDto } from "@/type/quote";

export const useGetQuotes = () => {
    return useQuery({
        queryKey: ["quotes"],
        queryFn: getQuotes,
    });
};

export const useCreateQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuoteDto) => createQuote(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
        },
    });
};

export const useUpdateQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateQuoteDto }) => updateQuote(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
        },
    });
};

export const useDeleteQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteQuote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
        },
    });
};
