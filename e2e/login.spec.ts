import { test, expect } from "@playwright/test";

test.describe("로그인 플로우", () => {
    test("사용자가 로그인할 수 있다", async ({ page }) => {
        // 고유한 테스트 계정 ID 생성
        const uniqueId = `testuser${Date.now()}`;

        try {
            await page.goto("/"); // 루트 경로로 변경

            // 로그인 폼이 로드될 때까지 대기
            await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

            // 먼저 회원가입 버튼 클릭
            await page.click("text=회원가입");

            // 회원가입 폼이 로드될 때까지 대기
            await page.waitForSelector('input[name="username"]', { timeout: 5000 });

            // 회원가입 폼 작성
            await page.fill('input[name="username"]', "테스트사용자");
            await page.fill('input[name="userId"]', uniqueId);
            await page.fill('input[name="password"]', "qwe123@@");
            await page.fill('input[name="confirmPassword"]', "qwe123@@");

            // 회원가입 제출
            await page.click("button[type='submit']");

            // 회원가입 완료 후 로그인 폼으로 돌아가기 대기
            await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

            // 폼 상태 초기화를 위해 페이지 새로고침
            await page.waitForTimeout(1000);

            // 로그인 폼이 로드될 때까지 다시 대기
            await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

            // 로그인 폼이 올바르게 렌더링되는지 확인
            await expect(page.locator("button[type='submit']")).toBeVisible();
            await page.fill('input[name="userId"]', uniqueId);
            await page.fill('input[name="password"]', "qwe123@@");
            await page.click("button[type='submit']");

            // 로그인 성공 시 메인 페이지로 리다이렉트되는지 확인
            await expect(page).toHaveURL("/main", { timeout: 15000 });
        } finally {
            // 테스트 완료 후 생성된 테스트 계정 삭제
            try {
                // 쿠키에서 accessToken 가져오기
                const cookies = await page.context().cookies();
                const accessTokenCookie = cookies.find((cookie) => cookie.name === "access_token");

                if (accessTokenCookie) {
                    await page.request.delete(`http://localhost:3001/users/me`, {
                        headers: {
                            Authorization: `Bearer ${accessTokenCookie.value}`,
                            "Content-Type": "application/json",
                        },
                    });
                }
            } catch (error) {
                console.log(`Failed to delete test user ${uniqueId}:`, error);
            }
        }
    });

    test("잘못된 로그인 정보로 실패", async ({ page }) => {
        await page.goto("/"); // 루트 경로로 변경

        // 로그인 폼이 로드될 때까지 대기
        await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

        await page.fill('input[name="userId"]', "wronguser");
        await page.fill('input[name="password"]', "wrongpassword");
        await page.click("button[type='submit']");

        // 에러 메시지가 표시되는지 확인
        await expect(page.locator('.error-message, [class*="error"], [class*="red"]')).toBeVisible();
    });

    test("빈 필드로 로그인 시도 시 에러 메시지 표시", async ({ page }) => {
        await page.goto("/"); // 루트 경로로 변경

        // 로그인 폼이 로드될 때까지 대기
        await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

        // 빈 필드로 로그인 시도
        await page.click('button[type="submit"]');

        // 폼 검증 에러 메시지가 표시되는지 확인
        await expect(page.locator("text=사용자 ID를 입력해주세요")).toBeVisible();
        await expect(page.locator("text=비밀번호를 입력해주세요")).toBeVisible();
    });

    test("회원가입 버튼 클릭 시 회원가입 폼으로 전환", async ({ page }) => {
        await page.goto("/");

        // 로그인 폼이 로드될 때까지 대기
        await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

        // 회원가입 버튼 클릭
        await page.click("text=회원가입");

        // 회원가입 폼이 로드될 때까지 대기
        await page.waitForSelector('input[name="username"]', { timeout: 5000 });

        // 회원가입 폼의 필드들이 보이는지 확인
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="userId"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    });

    test("로딩 중일 때 버튼이 비활성화된다", async ({ page }) => {
        await page.goto("/"); // 루트 경로로 변경

        // 로그인 폼이 로드될 때까지 대기
        await page.waitForSelector('input[name="userId"]', { timeout: 10000 });

        await page.fill('input[name="userId"]', "admin");
        await page.fill('input[name="password"]', "qwe123@@");
        await page.click('button[type="submit"]');

        // 로딩 중에 버튼이 비활성화되는지 확인 (짧은 시간)
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });
});
