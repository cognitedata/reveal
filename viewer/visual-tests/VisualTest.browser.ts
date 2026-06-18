/*!
 * Copyright 2026 Cognite AS
 */

import { assert } from '../packages/utilities/src/assert';
import type { VisualTestFixture } from './test-fixtures/VisualTestFixture';
import { setTestRendererKind, type TestRendererKind } from './test-fixtures/testRendererKind';

type VisualTestModule = {
  default: new () => VisualTestFixture;
  renderer?: TestRendererKind;
};

function testGenerator(): Map<string, () => Promise<VisualTestModule>> {
  const testMap = new Map<string, () => Promise<VisualTestModule>>();
  const visualTestsFixtures = import.meta.glob('../packages/**/*VisualTest.ts');

  Object.entries(visualTestsFixtures).forEach(visualTestsFixture => {
    const filename = visualTestsFixture[0]
      .split(/[\/]/)
      .pop()!
      .replace(/\.[^/.]+$/, '');
    const testModuleImport: () => Promise<VisualTestModule> =
      visualTestsFixture[1] as unknown as () => Promise<VisualTestModule>;
    testMap.set(filename, testModuleImport);
  });

  return testMap;
}

const tests = testGenerator();

let activeTest: VisualTestFixture;

async function runVisualTest(testName: string): Promise<void> {
  if (activeTest) {
    activeTest.dispose();
  }

  document.body.innerHTML = '';
  const testModuleImport = tests.get(testName);
  assert(testModuleImport !== undefined, 'Test not found: ' + testName);
  const testModule = await testModuleImport();
  setTestRendererKind(testModule.renderer ?? 'webgl');
  activeTest = new testModule.default();
  await activeTest.run();
}

(window as any).render = runVisualTest;

const urlParams = new URLSearchParams(window.location.search);
const testFixtureInstance = urlParams.get('testfixture');

if (testFixtureInstance !== null) {
  void (async function () {
    if (tests.has(testFixtureInstance)) {
      await runVisualTest(testFixtureInstance);
    } else {
      alert('Unrecognized test name:' + testFixtureInstance);
    }
  })();
}
