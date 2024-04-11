/*!
 * Copyright 2024 Cognite AS
 */
import { test, expect } from '@playwright/test';
import { loadStory } from './utils/loadStory';

test('cad model container storybook', async ({ page }) => {
  await loadStory(page, 'example-primitivewrappers-cadmodelcontainer');
  await expect(page).toHaveScreenshot();
});
