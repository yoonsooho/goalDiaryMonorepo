import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    webServer: [
        {
            command: "npm run dev",
            url: "http://localhost:3000",
            reuseExistingServer: false,
            timeout: 120 * 1000,
            env: {
                NEXT_PUBLIC_API_URL: "http://localhost:3001",
            },
        },
        // NestJS 백엔드 서버 (기존 PostgreSQL 컨테이너 사용)
        {
            command: "cd ../todoDndBack && docker start todoDndBack && sleep 15 && npm run start:dev",
            url: "http://localhost:3001",
            reuseExistingServer: false,
            timeout: 300 * 1000, // 5분 대기
            env: {
                DB_HOST: "localhost",
                DB_PORT: "5432",
                DB_USERNAME: "test",
                DB_PASSWORD: "test",
                DB_DATABASE: "todoDndBack",
            },
        },
    ],
});
