import { useDeleteContentItems, usePostContentItems, usePatchContentItems } from "@/app/hooks/apiHook/useContentItem";
import { boards } from "@/type/boards";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "@/hooks/use-toast";
import { patchContentItemsType } from "@/type/contentItems";

const useItemHandler = (setItems: React.Dispatch<React.SetStateAction<boards>>) => {
    const { mutate: postContentItems } = usePostContentItems();
    const { mutate: patchContentItems } = usePatchContentItems();
    const { mutate: deleteContentItems } = useDeleteContentItems();
    const queryClient = useQueryClient();
    // 새 아이템 추가
    const handleAddItem = (postId: number, itemName: string) => {
        if (itemName.trim() === "") return;
        postContentItems(
            { text: itemName, post_id: postId },
            {
                onSuccess: (data) => {
                    queryClient.invalidateQueries({ queryKey: ["posts"] });
                    toast({
                        title: "아이템 추가 완료",
                        description: "아이템 추가 완료",
                    });
                },
                onError: (error) => {
                    console.log(error);
                    toast({
                        title: "아이템 추가 실패",
                        description: "아이템 추가 실패",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    // 아이템 이름 수정
    const handleEditItem = (itemId: number, { text, startTime, endTime }: patchContentItemsType) => {
        if (!text) return;
        let data: patchContentItemsType = { text, startTime, endTime };
        patchContentItems(
            { contentItemId: itemId, data },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["posts"] });
                    toast({
                        title: "아이템 이름 수정 완료",
                        description: "아이템 이름 수정 완료",
                    });
                },
            }
        );
    };

    // 아이템 삭제
    const handleDeleteItem = (itemId: number) => {
        deleteContentItems(itemId, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["posts"] });
                toast({
                    title: "아이템 삭제 완료",
                    description: "아이템 삭제 완료",
                });
            },
            onError: (error) => {
                console.log(error);
                toast({
                    title: "아이템 삭제 실패",
                    description: "아이템 삭제 실패",
                    variant: "destructive",
                });
            },
        });
    };

    return { handleAddItem, handleEditItem, handleDeleteItem };
};

export default useItemHandler;
