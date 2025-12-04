"use client";

import React from "react";

type LoadingOverlayProps = {
    open: boolean;
    text?: string;
    zIndex?: number;
    blur?: boolean;
    className?: string;
};

export function LoadingOverlay({
    open,
    text = "처리 중입니다...",
    zIndex = 9999,
    blur = false,
    className,
}: LoadingOverlayProps) {
    if (!open) return null;

    return (
        <div
            className={`${
                blur ? "backdrop-blur-[2px]" : ""
            } fixed inset-0 bg-black/25 flex items-center justify-center ${className || ""}`}
            style={{ zIndex }}
            aria-modal
            role="dialog"
        >
            <div className="flex flex-col items-center gap-3 text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {text ? <p className="text-sm">{text}</p> : null}
            </div>
        </div>
    );
}

export default LoadingOverlay;
