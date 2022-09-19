/*!
 * Copyright 2022 Cognite AS
 */

// @ts-ignore
import visualTestsFixtures from '**/*.VisualTest.ts';

//TODO: remove for Reveal 4.0
import { revealEnv } from '../packages/utilities';
import { VisualTestFixture } from './test-fixtures/VisualTestFixture';
revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.3.0/';

async function testGenerator(): Promise<Map<string, VisualTestFixture>> {
  const testMap = new Map<string, VisualTestFixture>();

  visualTestsFixtures.forEach((visualTestsFixture: any) => {
    const testFixture: VisualTestFixture = new visualTestsFixture.module();
    testMap.set(visualTestsFixture.fileName, testFixture);
  });

  return testMap;
}

const tests = testGenerator();

let activeTest: VisualTestFixture;
(window as any).render = async (testName: string) => {
  if (activeTest) {
    activeTest.dispose();
  }
  document.body.innerHTML = '';
  activeTest = (await tests).get(testName)!;
  return activeTest!.run();
};

const urlParams = new URLSearchParams(window.location.search);
const testFixtureInstance = urlParams.get('testfixture');

if (testFixtureInstance !== null) {
  (async function () {
    const testMap = await tests;
    testMap.get(testFixtureInstance)!.run();
  })();
}
