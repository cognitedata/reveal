/*!
 * Copyright 2022 Cognite AS
 */

// @ts-ignore
import visualTestsFixtures from '**/*.VisualTest.ts';

//TODO: remove for Reveal 4.0
import { revealEnv } from '../packages/utilities';
revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.3.0/';

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
