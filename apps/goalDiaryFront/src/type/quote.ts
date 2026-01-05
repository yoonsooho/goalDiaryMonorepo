export interface QuoteType {
    id: number;
    content: string;
    author?: string;
    link?: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
}

export interface CreateQuoteDto {
    content: string;
    author?: string;
    link?: string;
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {}
