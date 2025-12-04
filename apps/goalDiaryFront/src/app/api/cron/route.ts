import { NextResponse } from "next/server";

export async function GET(req: Request) {
    return handleCron(req);
}

export async function POST(req: Request) {
    return handleCron(req);
}

async function handleCron(req: Request) {
    // Vercel cron은 Authorization 헤더를 보내지 않을 수 있음
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    // CRON_SECRET이 설정되어 있다면 인증 확인
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // 🔄 Render 서버 ping
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ping`);
        if (!res.ok) throw new Error("Ping failed");
        return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
    } catch (err) {
        console.error("❌ Render ping error:", err);
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
