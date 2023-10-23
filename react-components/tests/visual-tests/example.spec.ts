import { test, expect } from '@playwright/test';
import { loadStory } from './utils/loadStory';

test('has title', async ({ page }) => {
  await loadStory(page, 'example-toolbar--main');
  await expect(page).toHaveScreenshot();
});
