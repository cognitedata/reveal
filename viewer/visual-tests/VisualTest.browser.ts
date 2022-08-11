/*!
 * Copyright 2022 Cognite AS
 */

// @ts-ignore
import visualTestsFixtures from '**/*.VisualTest.ts';

async function testGenerator(): Promise<Map<string, () => Promise<void>>> {
  const testMap = new Map<string, () => Promise<void>>();

  visualTestsFixtures.forEach((visualTestsFixture: any) => {
    const testFixture = new visualTestsFixture.module();
    testMap.set(visualTestsFixture.fileName, () => testFixture.run());
  });

  return testMap;
}

const tests = testGenerator();

(window as any).render = async (testName: string) => {
  document.body.innerHTML = '';
  return (await tests).get(testName)!();
};

const urlParams = new URLSearchParams(window.location.search);
const testFixtureInstance = urlParams.get('testfixture');

if (testFixtureInstance !== null) {
  (async function () {
    const testMap = await tests;
    testMap.get(testFixtureInstance)!();
  })();
}
