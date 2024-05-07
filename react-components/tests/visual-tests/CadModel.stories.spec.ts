import { test, expect } from '@playwright/test';
import { loadStory } from './utils/loadStory';

test('cad model storybook', async ({ page }) => {
  await loadStory(page, 'example-primitivewrappers-cadmodel');
  await expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.02 });
});
