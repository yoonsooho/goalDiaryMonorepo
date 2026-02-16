"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: ReactNode;
    /** 스크롤 시 등장 애니메이션 딜레이(ms) */
    delay?: number;
    /** 루트와 교차 비율 (0~1). 이만큼 보이면 등장 */
    threshold?: number;
    /** 루트 마진 (뷰포트 밖에서 미리 트리거) */
    rootMargin?: string;
    className?: string;
}

/**
 * 뷰포트에 들어왔을 때 fade-in-up 애니메이션. 초기엔 opacity-40 + translate-y-14(56px).
 */
export function ScrollReveal({
    children,
    delay = 0,
    threshold = 0.05,
    rootMargin = "0px 0px -60px 0px",
    className,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setInView(true);
            },
            { threshold, rootMargin }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold, rootMargin]);

    return (
        <div
            ref={ref}
            className={cn("opacity-40 translate-y-14", inView && "animate-fade-in-up", className)}
            style={inView ? { animationDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    );
}
