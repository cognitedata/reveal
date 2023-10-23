import { type Page } from '@playwright/test';
import fs from 'fs';

// config
const PROJECT_ROOT = new URL('../../../', import.meta.url);
const STORYBOOK_DIR = new URL('./storybook-static/', PROJECT_ROOT);

/** Load Storybook story for Playwright testing */
export async function loadStory(page: Page, storyID: string): Promise<void> {
  // load stories.json
  const storiesManifestLoc = new URL('stories.json', STORYBOOK_DIR);
  if (!fs.existsSync(storiesManifestLoc)) {
    console.error(
      '✘ Could not find storybook-static/stories.json. Try rebuilding with `npm run build:sb`'
    );
    process.exit(1);
  }
  const storiesManifest = JSON.parse(fs.readFileSync(storiesManifestLoc, 'utf8'));

  // load specific story
  const storyMeta = storiesManifest.stories[storyID];
  if (storyMeta === undefined) {
    console.error(
      `✘ Could not find story ID "${storyID}". Try rebuilding with \`npm run build:sb\``
    );
    process.exit(1);
  }
  const search = new URLSearchParams({ viewMode: 'story', id: storyMeta.id });
  await page.goto(`iframe.html?${search.toString()}`, { waitUntil: 'networkidle' });

  // wait for page to finish rendering before starting test
  await page.waitForSelector('#storybook-root');

  await new Promise((resolve) => setTimeout(resolve, 2000));
}
