import { test, expect } from "@playwright/test";

test.describe("메인 페이지", () => {
    test.beforeEach(async ({ page }) => {
        const uniqueId = `e2emain${Date.now()}`;
        await page.goto("/");
        await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

        await page.click("text=회원가입");
        await page.waitForSelector('input[name="username"]', { timeout: 5000 });
        await page.fill('input[name="username"]', "e2e메인유저");
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
        // 메인 콘텐츠 로드 대기
        await page.getByRole("button", { name: /새 일정 만들기/ }).waitFor({ state: "visible", timeout: 10000 });
    });

    test("메인 페이지에 일정·루틴 섹션과 버튼이 표시된다", async ({ page }) => {
        // 버튼은 상단에 있으므로 먼저 확인
        await expect(page.getByRole("button", { name: /새 일정 만들기/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /새 루틴 만들기/ })).toBeVisible();

        // 섹션 제목만 매칭 (empty state "아직 등록된 일정이 없어요" 제외)
        const scheduleHeading = page.getByRole("heading", { name: "일정", exact: true });
        await scheduleHeading.scrollIntoViewIfNeeded();
        await expect(scheduleHeading).toBeVisible({ timeout: 5000 });

        const routineHeading = page.getByRole("heading", { name: "루틴", exact: true });
        await routineHeading.scrollIntoViewIfNeeded();
        await expect(routineHeading).toBeVisible({ timeout: 5000 });
    });

    test("새 일정 만들기 버튼 클릭 시 모달이 열린다", async ({ page }) => {
        await page.getByRole("button", { name: /새 일정 만들기/ }).click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
        await expect(page.getByPlaceholder("일정 제목을 입력하세요")).toBeVisible({ timeout: 5000 });
    });

    test("네비게이션에서 일기 링크 클릭 시 일기 페이지로 이동한다", async ({ page }) => {
        await page.getByRole("link", { name: "일기" }).click();
        await expect(page).toHaveURL(/\/diary/, { timeout: 10000 });
    });
});
