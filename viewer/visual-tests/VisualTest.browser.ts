/*!
 * Copyright 2022 Cognite AS
 */

import { assert } from '../packages/utilities/src/assert';
import type { VisualTestFixture } from './test-fixtures/VisualTestFixture';

function testGenerator(): Map<string, () => Promise<{ default: new () => VisualTestFixture }>> {
  const testMap = new Map<string, () => Promise<{ default: new () => VisualTestFixture }>>();
  const visualTestsFixtures = import.meta.glob('../packages/**/*VisualTest.ts');

  Object.entries(visualTestsFixtures).forEach(visualTestsFixture => {
    const filename = visualTestsFixture[0]
      .split(/[\/]/)
      .pop()!
      .replace(/\.[^/.]+$/, '');
    const testModuleImport: () => Promise<{ default: new () => VisualTestFixture }> =
      visualTestsFixture[1] as unknown as () => Promise<{ default: new () => VisualTestFixture }>;
    testMap.set(filename, testModuleImport);
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
  const testModuleImport = tests.get(testName);
  assert(testModuleImport !== undefined, 'Test not found: ' + testName);
  const testModule = await testModuleImport();
  activeTest = new testModule.default();
  return activeTest.run();
};

const urlParams = new URLSearchParams(window.location.search);
const testFixtureInstance = urlParams.get('testfixture');

if (testFixtureInstance !== null) {
  (async function () {
    if (tests.has(testFixtureInstance)) {
      const testModuleImport = tests.get(testFixtureInstance);
      assert(testModuleImport !== undefined, 'Test not found: ' + testFixtureInstance);
      const testModule = await testModuleImport();
      const visualTestInstance = new testModule.default();
      await visualTestInstance.run();
    } else {
      alert('Unrecognized test name:' + testFixtureInstance);
    }
  })();
}
