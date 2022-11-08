/*!
 * Copyright 2022 Cognite AS
 */

// @ts-ignore
import visualTestsFixtures from '**/*.VisualTest.ts';

import { VisualTestFixture } from './test-fixtures/VisualTestFixture';

async function testGenerator(): Promise<Map<string, new () => VisualTestFixture>> {
  const testMap = new Map<string, new () => VisualTestFixture>();

  visualTestsFixtures.forEach((visualTestsFixture: any) => {
    testMap.set(visualTestsFixture.fileName, visualTestsFixture.module);
  });

  return testMap;
}

const tests = testGenerator();

let activeTest: any;
(window as any).render = async (testName: string) => {
  if (activeTest) {
    activeTest.dispose();
  }

  document.body.innerHTML = '';
  const testConstructor = (await tests).get(testName)!;
  activeTest = new testConstructor();
  return activeTest.run();
};

const urlParams = new URLSearchParams(window.location.search);
const testFixtureInstance = urlParams.get('testfixture');

if (testFixtureInstance !== null) {
  (async function () {
    const testMap = await tests;
    if (testMap.has(testFixtureInstance)) {
      new (testMap.get(testFixtureInstance)!)().run();
    } else {
      alert('Unrecognized test name:' + testFixtureInstance);
    }
  })();
}
