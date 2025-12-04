"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "확인",
    description = "이 작업을 진행하시겠습니까?",
    confirmText = "확인",
    cancelText = "취소",
    variant = "default",
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={variant === "destructive" ? "bg-red-600 hover:bg-red-700 focus:ring-red-600" : ""}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// 사용하기 쉬운 훅도 제공
import { useState } from "react";

export function useConfirmModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [modalProps, setModalProps] = useState<Partial<ConfirmModalProps>>({});

    const openConfirm = (
        action: () => void,
        props?: Partial<Pick<ConfirmModalProps, "title" | "description" | "confirmText" | "cancelText" | "variant">>
    ) => {
        setConfirmAction(() => action);
        setModalProps(props || {});
        setIsOpen(true);
    };

    const closeConfirm = () => {
        setIsOpen(false);
        setConfirmAction(null);
        setModalProps({});
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        closeConfirm();
    };

    const ConfirmModalComponent = () => (
        <ConfirmModal isOpen={isOpen} onClose={closeConfirm} onConfirm={handleConfirm} {...modalProps} />
    );

    return {
        openConfirm,
        closeConfirm,
        ConfirmModal: ConfirmModalComponent,
    };
}
