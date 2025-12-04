import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import DiaryList from "@/app/components/diary/DiaryList";

const DiaryPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-6">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/diary/new" className="mb-6 flex gap-3">
                        <Button className="flex items-center gap-2">
                            <PlusIcon className="h-4 w-4" />새 일기 만들기
                        </Button>
                    </Link>
                </div>
            </div>
            <DiaryList />
        </div>
    );
};

export default DiaryPage;
