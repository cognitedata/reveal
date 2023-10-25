import { test, expect } from '@playwright/test';
import { loadStory } from './utils/loadStory';

test('cad model container storybook', async ({ page }) => {
  await loadStory(page, 'example-primitivewrappers-cadmodelcontainer');
  const storyDone = page.locator('#story-done');
  await storyDone.waitFor({ state: 'attached' });
  await expect(page).toHaveScreenshot();
});
