import { expect, test } from "@playwright/test";

const adminEmail = process.env.ADMIN_EMAIL || "replace_with_admin_email@example.com";
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "ReplaceWithAStrongPassword123!";

test("public portfolio renders and private fields are absent", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Ankita Singh/i })).toBeVisible();
  await expect(page.getByText(/Research Analyst/i).first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/father|date of birth|private address/i);
});

test("administrator can log in and view dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: /login/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole("button", { name: /Profile/i })).toBeVisible();
});

test("visitor can submit contact form", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Playwright Visitor");
  await page.getByLabel("Email").fill("visitor@example.com");
  await page.getByLabel("Subject").fill("Portfolio enquiry");
  await page.getByLabel("Message").fill("I would like to send a professional contact message.");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Message sent.")).toBeVisible();
});
