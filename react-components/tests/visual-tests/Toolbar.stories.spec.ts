import { test, expect } from '@playwright/test';
import { loadStory } from './utils/loadStory';

test('tool bar storybook', async ({ page }) => {
  await loadStory(page, 'example-toolbar');

  await page.locator('button[aria-label="Fit camera to models"]').first().click();
  await page.locator('button[aria-label="Slice models"]').first().click();

  // Wait for the camera to move
  await new Promise((resolve) => setTimeout(resolve, 2100));

  await expect(page).toHaveScreenshot();
});
