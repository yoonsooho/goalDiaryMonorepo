"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function DropdownMenuDialog({
    title,
    dropdownItemsList,
    className,
    useDropdownIcon = true,
}: {
    title: string | React.ReactNode;
    dropdownItemsList: { label: string; onClick: () => void }[];
    className?: string;
    useDropdownIcon?: boolean;
}) {
    const [internalOpen, setInternalOpen] = useState(false);

    const handleOpenChange = () => {
        setInternalOpen((prev) => !prev);
    };

    return (
        <>
            <DropdownMenu modal={false} open={internalOpen} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <span aria-label="dropdown menu" className={cn("flex items-center", className)}>
                        {title}{" "}
                        {useDropdownIcon && (
                            <ChevronDownIcon
                                className={cn(
                                    "w-4 h-4 ml-2",
                                    internalOpen
                                        ? "rotate-180 transition-transform duration-200"
                                        : "transition-transform duration-200"
                                )}
                            />
                        )}
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuGroup>
                        {dropdownItemsList.map((item) => (
                            <DropdownMenuItem key={item.label} onClick={item.onClick} className="cursor-pointer">
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
