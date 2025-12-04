"use client";
import dynamic from "next/dynamic";
import React from "react";
import "react-quill-new/dist/quill.snow.css";
import { PageLoading } from "../ui/loading";
import { FieldErrors } from "react-hook-form";

const QuillNoSSRWrapper = dynamic(
    async () => {
        const { default: ReactQuill } = await import("react-quill-new");
        return { default: ReactQuill };
    },
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center">
                <PageLoading />
            </div>
        ),
    }
);

interface TextEditorProps {
    value: string;
    setValue: (value: string) => void;
    height?: number;
    className?: string;
    errors?: FieldErrors<any>;
}

const TextEditor = ({ value, setValue, className, height = 500, errors }: TextEditorProps) => {
    return (
        <div className={className}>
            <QuillNoSSRWrapper theme="snow" value={value} onChange={setValue} />
            <style jsx global>{`
                .ql-container {
                    height: 100% !important;
                    min-height: ${height}px !important;
                }
            `}</style>
        </div>
    );
};

export default TextEditor;
