import { test, expect } from "@playwright/test";

test("ログインページにログインボタンがある", async ({ page }) => {
  await page.goto("/auth/signin");
  const button = page.getByRole("button", { name: "ログイン" });
  await expect(button).toBeVisible();
});
