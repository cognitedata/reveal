/*!
 * Copyright 2022 Cognite AS
 */

import { glob } from 'glob';
import path from 'path';
const puppeteerGlobalSetup = require('jest-environment-puppeteer/setup');

export default async (): Promise<void> => {
  const testFilesPaths = await new Promise<string[]>(resolve => {
    glob('**/*.VisualTestFixture.ts', (_, files) => {
      resolve(files);
    });
  });

  const testFiles = testFilesPaths
    .map(filePath => {
      return path.parse(filePath).name;
    })
    .join(',');

  (process.env as any).TEST_FIXTURES = testFiles;
  await puppeteerGlobalSetup();
};
