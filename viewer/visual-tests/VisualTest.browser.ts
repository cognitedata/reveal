/*!
 * Copyright 2022 Cognite AS
 */

// import assert from 'assert';
import * as visualTests from './../packages/visualTests.root';

// const environment = process?.env?.NODE_ENV ?? 'browser';

// assert(environment === 'browser');

const tests = testGenerator();

(window as any).render = async (testName: string) => {
  document.body.innerHTML = '';
  return (await tests).get(testName)!();
};

async function testGenerator(): Promise<Map<string, () => Promise<void>>> {
  const testMap = new Map<string, () => Promise<void>>();

  visualTests.default.forEach(visualTest => {
    const testFixture = new visualTest();
    testMap.set(visualTest.name, () => testFixture.run());
  });

  return testMap;
}
