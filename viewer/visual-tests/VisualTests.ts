/*!
 * Copyright 2022 Cognite AS
 */

import { Page } from 'puppeteer';

const environment = process?.env?.NODE_ENV ?? 'browser';

if (environment === 'browser') {
  const tests = testGenerator();

  (window as any).render = async (testName: string) => {
    document.body.innerHTML = '';
    return (await tests).get(testName)!();
  };

  (window as any).getAllTestFixtures = async () => {
    document.body.innerHTML = '';
    return Array.from((await tests).keys());
  };

  async function testGenerator(): Promise<Map<string, () => Promise<void>>> {
    const testMap = new Map<string, () => Promise<void>>();

    const { SectorParserTestApp } = await import('../packages/sector-parser/app/index');
    const sectorParserTestApp = new SectorParserTestApp();
    testMap.set(SectorParserTestApp.name, () => sectorParserTestApp.run());

    const { SectorLoaderVisualTestFixture } = await import('../packages/sector-loader/app/index');
    const sectorLoaderVisualTestFixture = new SectorLoaderVisualTestFixture();
    testMap.set(SectorLoaderVisualTestFixture.name, () => sectorLoaderVisualTestFixture.run());

    return testMap;
  }
} else if (environment === 'test') {
  describe('Visual tests', () => {
    let testPage: Page;
    let testFixtures: string[];

    beforeAll(async () => {
      testPage = await browser.newPage();
      await testPage.goto('https://localhost:12345/', {
        waitUntil: ['domcontentloaded']
      });

      testFixtures = await testPage.evaluate(async () => {
        return (window as any).getAllTestFixtures();
      });

      console.log(testFixtures);
    });

    console.log('asd');

    test.each(testFixtures!)('%p', async testName => {
      await runTest(testName);
    });

    afterAll(done => {
      testPage.close().then(() => done());
    });

    async function runTest(name: string) {
      await testPage.evaluate(async (testName: string) => {
        return (window as any).render(testName) as Promise<void>;
      }, name);

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
