import { type Page } from '@playwright/test';

import type storyOutput from '../../../storybook-static/index.json';

type StoryName = keyof typeof storyOutput.entries extends `${infer T}--${string}` ? T : never;

/** Load Storybook story for Playwright testing */
export async function loadStory(page: Page, storyID: StoryName): Promise<void> {
  const search = new URLSearchParams({ viewMode: 'story', id: `${storyID}--main` });
  await page.goto(`iframe.html?${search.toString()}`, {
    waitUntil: 'load',
    timeout: 60000
  });

  const storyDoneLocator = page.locator('#story-done');
  await storyDoneLocator.waitFor({ state: 'attached' });

  await viewerLoadingSettled(page);
}

// waits for loading spinner to settle indicating that the viewer is ready
async function viewerLoadingSettled(page: Page): Promise<void> {
  const spinner = page.locator('.reveal-viewer-spinner');
  await spinner.waitFor({ state: 'attached' });
  await spinner.evaluate(async (spinner) => {
    await new Promise<void>((resolve) => {
      let debounceSettled: ReturnType<typeof setTimeout> | undefined;
      if (!(spinner.className as string).includes('loading')) {
        debounceSettled = setTimeout(() => {
          resolve();
        }, 200);
      }
      new MutationObserver(() => {
        if (!(spinner.className as string).includes('loading')) {
          if (debounceSettled !== undefined) {
            return;
          }
          debounceSettled = setTimeout(() => {
            resolve();
          }, 100);
        } else {
          if (debounceSettled !== undefined) {
            clearTimeout(debounceSettled);
            debounceSettled = undefined;
          }
        }
      }).observe(spinner, { attributes: true });
    });
  });
}
