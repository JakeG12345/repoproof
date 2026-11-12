import { expect, test } from "@playwright/test";

test("root opens the workspace experience", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Report credits")).toBeVisible();
  await expect(page.getByText("Add the first candidate")).toBeVisible();
  await expect(page.getByText("Decision support only")).toBeVisible();
});

test("candidate intake is a functional workflow", async ({ page }) => {
  await page.goto("/candidates/new");
  await expect(page.getByRole("heading", { name: "New Candidate" })).toBeVisible();
  await expect(page.getByText("Exact GitHub profile or repository URL")).toBeVisible();
  await expect(page.getByText("Public GitHub mode")).toBeVisible();
});

test("missing reports do not fall back to fixture data", async ({ page }) => {
  await page.goto("/reports/report_initial");
  await expect(page.getByText("No report found")).toBeVisible();
});

test("PDF export returns not found for missing reports", async ({ request }) => {
  const response = await request.get("/reports/report_initial/export?format=pdf");
  expect(response.status()).toBe(404);
});
