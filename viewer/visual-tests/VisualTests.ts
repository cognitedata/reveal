/*!
 * Copyright 2022 Cognite AS
 */

import { Page } from 'puppeteer';

const environment = process?.env?.NODE_ENV ?? 'browser';

if (environment === 'browser') {
  const tests = testGenerator();

  (window as any).render = async () => {
    return tests.next();
  };

  async function* testGenerator(): AsyncGenerator<void> {
    const { SectorParserTestApp } = await import('../packages/sector-parser/app/index');
    const sectorParserTestApp = new SectorParserTestApp();
    yield sectorParserTestApp.run();

    document.body.innerHTML = '';

    const { SectorLoaderVisualTestFixture } = await import('../packages/sector-loader/app/index');
    const sectorLoaderVisualTestFixture = new SectorLoaderVisualTestFixture();
    yield sectorLoaderVisualTestFixture.run();

    document.body.innerHTML = '';
  }
} else if (environment === 'test') {
  describe('Parser worker visual tests', () => {
    let testPage: Page;

    beforeAll(done => {
      browser
        .newPage()
        .then(page => {
          testPage = page;
          return testPage.goto('https://localhost:12345/', {
            waitUntil: ['domcontentloaded']
          });
        })
        .then(() => done());
    });

    test.each(['SectorParser', 'SectorLoader'])('%p', async testName => {
      await runTest(testName);
    });

    afterAll(done => {
      testPage.close().then(() => done());
    });

    async function runTest(name: string) {
      await testPage.evaluate(async () => {
        const app = (window as any).render() as Promise<void>;
        await app;
      });

      const canvas = await testPage.$('canvas');

      const image = await canvas!.screenshot();

      expect(image).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
        customSnapshotIdentifier: name,
        comparisonMethod: 'ssim'
      });
    }
  });
}

export {};
