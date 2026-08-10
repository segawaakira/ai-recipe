import { test, expect } from "@playwright/test";

test("存在しない要素が表示されること（意図的に失敗）", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("存在しないテキスト12345")).toBeVisible({ timeout: 3000 });
});
