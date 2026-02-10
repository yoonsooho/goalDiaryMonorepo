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
        // 메인 콘텐츠 로드 대기 (일정 섹션 표시)
        await page.getByRole("heading", { name: "일정", exact: true }).waitFor({ state: "visible", timeout: 10000 });
    });

    test("메인 페이지에 일정·루틴 섹션과 추가 UI가 표시된다", async ({ page }) => {
        const scheduleHeading = page.getByRole("heading", { name: "일정", exact: true });
        await scheduleHeading.scrollIntoViewIfNeeded();
        await expect(scheduleHeading).toBeVisible({ timeout: 5000 });

        const routineHeading = page.getByRole("heading", { name: "루틴", exact: true });
        await routineHeading.scrollIntoViewIfNeeded();
        await expect(routineHeading).toBeVisible({ timeout: 5000 });

        // 일정: 빠른 추가 입력 또는 상세 만들기 링크
        await expect(page.getByPlaceholder("할 일을 입력하고 엔터")).toBeVisible();
        await expect(page.getByRole("button", { name: /날짜·기간을 지정해서 만들고 싶다면 클릭/ })).toBeVisible();

        // 루틴: 새 루틴 만들기 버튼
        await expect(page.getByRole("button", { name: /새 루틴 만들기/ })).toBeVisible();
    });

    test("기간·팀 지정 링크 클릭 시 일정 생성 모달이 열린다", async ({ page }) => {
        await page.getByRole("button", { name: /날짜·기간을 지정해서 만들고 싶다면 클릭/ }).click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
        await expect(page.getByPlaceholder("일정 제목을 입력하세요")).toBeVisible({ timeout: 5000 });
    });

    test("네비게이션에서 일기 링크 클릭 시 일기 페이지로 이동한다", async ({ page }) => {
        await page.getByRole("link", { name: "일기" }).click();
        await expect(page).toHaveURL(/\/diary/, { timeout: 10000 });
    });
});
