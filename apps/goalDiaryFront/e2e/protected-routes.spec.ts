import { test, expect } from "@playwright/test";

test.describe("보호된 라우트 (비로그인)", () => {
    test("비로그인 시 /main 접근 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
        await page.goto("/main", { waitUntil: "domcontentloaded" });
        await expect(page.locator('input[name="userId"]')).toBeVisible({ timeout: 10000 });
        await expect(page).not.toHaveURL(/\/main/);
    });

    test("비로그인 시 /diary 접근 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
        await page.goto("/diary", { waitUntil: "domcontentloaded" });
        await expect(page.locator('input[name="userId"]')).toBeVisible({ timeout: 10000 });
        await expect(page).not.toHaveURL(/\/diary/);
    });

    test("비로그인 시 /main/schedules/1 접근 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
        await page.goto("/main/schedules/1", { waitUntil: "domcontentloaded" });
        await expect(page.locator('input[name="userId"]')).toBeVisible({ timeout: 10000 });
    });
});
