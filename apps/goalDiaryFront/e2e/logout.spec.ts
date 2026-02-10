import { test, expect } from "@playwright/test";

test.describe("로그아웃 플로우", () => {
    test("로그인 후 로그아웃하면 로그인 페이지로 이동한다", async ({ page }) => {
        const uniqueId = `e2elogout${Date.now()}`;

        try {
            await page.goto("/");
            await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

            // 회원가입
            await page.click("text=회원가입");
            await page.waitForSelector('input[name="username"]', { timeout: 5000 });
            await page.fill('input[name="username"]', "e2e로그아웃유저");
            await page.fill('input[name="userId"]', uniqueId);
            await page.fill('input[name="password"]', "qwe123@@");
            await page.fill('input[name="confirmPassword"]', "qwe123@@");
            await page.click("button[type='submit']");

            await page.waitForSelector('input[name="userId"]', { timeout: 10000 });
            await page.waitForTimeout(500);
            await page.fill('input[name="userId"]', uniqueId);
            await page.fill('input[name="password"]', "qwe123@@");
            await page.click("button[type='submit']");

            await expect(page).toHaveURL("/main", { timeout: 15000 });

            // 헤더에서 사용자 메뉴(드롭다운) 열기 → 로그아웃 클릭
            await page.getByLabel("dropdown menu").click();
            await page.getByRole("menuitem", { name: "로그아웃" }).waitFor({ state: "visible", timeout: 3000 });
            await page.getByRole("menuitem", { name: "로그아웃" }).click();

            await expect(page).toHaveURL("/", { timeout: 10000 });
            await expect(page.locator('input[name="userId"]')).toBeVisible();
        } finally {
            try {
                const cookies = await page.context().cookies();
                const accessTokenCookie = cookies.find((c) => c.name === "access_token");
                if (accessTokenCookie) {
                    await page.request.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/me`, {
                        headers: {
                            Authorization: `Bearer ${accessTokenCookie.value}`,
                            "Content-Type": "application/json",
                        },
                    });
                }
            } catch {
                // 정리 실패 시 무시
            }
        }
    });

    test("로그아웃 후 메인에 직접 접근하면 로그인 페이지로 리다이렉트된다", async ({ page }) => {
        await page.goto("/main", { waitUntil: "commit" });
        await expect(page).toHaveURL(/\//, { timeout: 10000 });
        await expect(page).not.toHaveURL(/\/main/);
    });
});
