import { contentItem } from "@/type/boards";

export type contentItems = {
    text: string;
    id: number;
    seq: number;
};

export type postContentItemsType = {
    text: string;
    post_id: number;
};
export type patchContentItemsType = Partial<Omit<contentItem, "id">>;

export type moveContentItems = {
    contentItemId: number;
    fromPostId: string;
    toPostId: string;
    toPostContentItems: Omit<contentItems, "text">[];
};

export type swapContentItemTimes = {
    firstContentItemId: number;
    secondContentItemId: number;
};
