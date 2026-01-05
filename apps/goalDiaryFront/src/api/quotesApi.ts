import { commonApi, commonApiJson } from "@/api/commonApi";
import { CreateQuoteDto, QuoteType, UpdateQuoteDto } from "@/type/quote";

export const getQuotes = async () => {
    return await commonApiJson("/api/quotes", {
        method: "GET",
        requireAuth: true,
    });
};

export const createQuote = async (data: CreateQuoteDto) => {
    return await commonApiJson("/api/quotes", {
        method: "POST",
        body: data,
        requireAuth: true,
    });
};

export const updateQuote = async (id: number, data: UpdateQuoteDto) => {
    return await commonApiJson(`/api/quotes/${id}`, {
        method: "PATCH",
        body: data,
        requireAuth: true,
    });
};

export const deleteQuote = async (id: number) => {
    await commonApi(`/api/quotes/${id}`, {
        method: "DELETE",
        requireAuth: true,
    });
    return;
};
