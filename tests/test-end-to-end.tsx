import { test, expect } from '@playwright/test';

test.describe('Venue Persistence Flow', () => {
  
  test('should add a venue to recent searches when clicked on search page', async ({ page }) => {
    // 1. Go to the search page with a query
    // Adjust the URL to match your local dev environment
    await page.goto('http://localhost:3000/search?q=coffee');

    // 2. Find a search result and click it
    // We assume your search result has the name of the venue in an <h2> or similar
    const firstResult = page.locator('h2').first();
    const venueName = await firstResult.innerText();
    
    await firstResult.click();

    // 3. The app should have navigated to the Home Page (/)
    await expect(page).toHaveURL('http://localhost:3000/');

    // 4. Check if the sidebar now contains the venue name
    const sidebar = page.locator('nav, .w-80'); // Adjust selector to your AppSidebar class/tag
    await expect(sidebar).toContainText(venueName);

    // 5. REFRESH TEST: Ensure it resets on refresh as requested
    await page.reload();
    
    // The sidebar should no longer contain that venue because state was reset
    await expect(sidebar).not.toContainText(venueName);
  });
});