"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 뷰포트에 들어오면 작아졌다가 튀어오르는(pop-in) 강조 애니메이션
 */
export function PopInOnScroll({
    children,
    className,
    threshold = 0.15,
}: {
    children: ReactNode;
    className?: string;
    threshold?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setInView(true);
            },
            { threshold }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={cn(
                "origin-center",
                !inView && "scale-[0.94] opacity-90",
                inView && "animate-pop-in",
                className
            )}
        >
            {children}
        </div>
    );
}
