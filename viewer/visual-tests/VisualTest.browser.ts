/*!
 * Copyright 2022 Cognite AS
 */

/// <reference types="vite/client" />

function testGenerator(): Map<string, () => Promise<unknown>> {
  const testMap = new Map<string, () => Promise<unknown>>();
  const visualTestsFixtures = import.meta.glob('../packages/**/*VisualTest.ts');

  Object.entries(visualTestsFixtures).forEach(visualTestsFixture => {
    const filename = visualTestsFixture[0]
      .split(/[\/]/)
      .pop()!
      .replace(/\.[^/.]+$/, '');
    testMap.set(filename, visualTestsFixture[1]);
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
  const testConstructor = (await tests.get(testName)!()) as any;
  activeTest = new testConstructor.default();
  return activeTest.run();
};

const urlParams = new URLSearchParams(window.location.search);
const testFixtureInstance = urlParams.get('testfixture');

if (testFixtureInstance !== null) {
  (async function () {
    if (tests.has(testFixtureInstance)) {
      const asd = (await tests.get(testFixtureInstance)!()) as any;
      new asd.default().run();
    } else {
      alert('Unrecognized test name:' + testFixtureInstance);
    }
  })();
}
