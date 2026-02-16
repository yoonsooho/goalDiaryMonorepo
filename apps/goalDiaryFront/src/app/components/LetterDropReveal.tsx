"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LetterDropRevealProps {
    text: string;
    className?: string;
    /** 뷰포트에 이만큼 보이면 재생 */
    threshold?: number;
    /** 글자당 딜레이(ms) */
    delayPerChar?: number;
}

/**
 * 제목 텍스트를 한 글자씩 위→아래로 떨어지며 등장. 섹션에 들어왔을 때만 재생.
 */
export function LetterDropReveal({
    text,
    className,
    threshold = 0.15,
    delayPerChar = 42,
}: LetterDropRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    const chars = Array.from(text);

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
        <div ref={ref} className={cn("inline", className)}>
            {chars.map((char, i) => (
                <span
                    key={i}
                    className={cn(
                        "inline-block opacity-0 -translate-y-4",
                        inView && "animate-letter-drop"
                    )}
                    style={inView ? { animationDelay: `${i * delayPerChar}ms` } : undefined}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </div>
    );
}
