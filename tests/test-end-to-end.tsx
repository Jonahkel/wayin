import { test, expect } from "@playwright/test";

test.describe("Venue Persistence Flow", () => {
  test("should add a venue to recent searches when clicked on search page", async ({
    page,
  }) => {
    // 1. Go to the search page with a query
    // Adjust the URL to match your local dev environment
    await page.goto("http://localhost:3000/search?q=coffee");

    // 2. Find a search result and click it
    // We assume your search result has the name of the venue in an <h2> or similar
    const firstResult = page.locator("h2").first();
    const venueName = await firstResult.innerText();

    await firstResult.click();

    // 3. The app should have navigated to the Home Page (/)
    await expect(page).toHaveURL("http://localhost:3000/");

    // 4. Check if the sidebar now contains the venue name
    const sidebar = page.locator("nav, .w-80"); // Adjust selector to your AppSidebar class/tag
    await expect(sidebar).toContainText(venueName);

    // 5. REFRESH TEST: Ensure it resets on refresh as requested
    await page.reload();

    // The sidebar should no longer contain that venue because state was reset
    await expect(sidebar).not.toContainText(venueName);
  });
});

test.describe("test-search-bar-on-results-page", () => {
  // test-search-bar-on-results-page
  test("should run a new search from the results page when user submits a different query", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/search?q=starbucks");

    const searchInput = page.getByPlaceholder("Search");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("coffee");
    await searchInput.press("Enter");

    // Submitting a new query should update the URL params and refresh results.
    await expect(page).toHaveURL(/\/search\?q=coffee/);
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      '"coffee"',
    );
  });
});

test.describe("test-menu-bar", () => {
  test("should open the menu sidebar at tablet widths where menu button is visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 900 });
    await page.goto("http://localhost:3000/");

    const menuButton = page.getByRole("button", { name: "Open venue list" });
    await expect(menuButton).toBeVisible();

    const mobileMenuDialog = page.getByRole("dialog");
    const mobileSidebar = page.getByRole("complementary", {
      name: "Venue sidebar",
    });
    await expect(mobileMenuDialog).toBeHidden();
    await expect(mobileSidebar).toBeHidden();

    await menuButton.click();

    await expect(mobileMenuDialog).toBeVisible();
    await expect(mobileSidebar).toBeVisible();
  });
});
