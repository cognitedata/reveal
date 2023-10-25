import { type Page } from '@playwright/test';

import type storyOutput from '../../../storybook-static/stories.json';

type StoryName = keyof typeof storyOutput.stories extends `${infer T}--${string}` ? T : never;

/** Load Storybook story for Playwright testing */
export async function loadStory(page: Page, storyID: StoryName): Promise<void> {
  const search = new URLSearchParams({ viewMode: 'story', id: `${storyID}--main` });
  await page.goto(`iframe.html?${search.toString()}`, { waitUntil: 'networkidle', timeout: 60000 });

  // wait for page to finish rendering before starting test
  await page.waitForSelector('#storybook-root');

  await new Promise((resolve) => setTimeout(resolve, 2000));
}
