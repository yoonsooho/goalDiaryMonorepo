import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
};

export function Loading({ size = "md", text = "로딩중입니다...", fullScreen = false, className }: LoadingProps) {
    const containerClass = fullScreen
        ? "flex flex-col justify-center items-center h-screen space-y-4"
        : "flex flex-col justify-center items-center space-y-4";

    return (
        <div className={cn(containerClass, className)}>
            <Loader2 className={cn(sizeMap[size], "animate-spin text-primary")} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
    );
}

// 특정 용도별 프리셋 컴포넌트들
export function PageLoading({ text }: { text?: string }) {
    return <Loading fullScreen text={text || "페이지를 로딩중입니다..."} />;
}

export function ButtonLoading() {
    return <Loading size="sm" text="" className="py-2" />;
}

export function CardLoading({ text }: { text?: string }) {
    return <Loading size="md" text={text || "로딩중..."} className="py-8" />;
}
