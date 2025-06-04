import { describe, test, expect, beforeAll } from 'vitest';
import { RootDomainObject } from './RootDomainObject';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { sdkMock } from '#test-utils/fixtures/sdk';

describe(RootDomainObject.name, () => {
  let renderTarget: RevealRenderTarget;
  beforeAll(() => {
    renderTarget = createRenderTargetMock();
  });

  test('should have following default values', () => {
    const domainObject = new RootDomainObject(renderTarget, sdkMock);
    expect(domainObject.renderTarget).toBe(renderTarget);
    expect(domainObject.sdk).toBe(sdkMock);
    expect(domainObject.fdmSdk).toBeDefined();
    expect(domainObject.typeName).toBeDefined();
    expect(domainObject.icon).toBeDefined();
    expect(domainObject.hasIconColor).toBe(false);
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(domainObject.isRoot).toBe(true);
  });

  test('should clone', () => {
    const domainObject = new RootDomainObject(renderTarget, sdkMock);
    expect(domainObject.clone()).instanceOf(RootDomainObject);
    expect(domainObject.clone()).not.toBe(domainObject);
  });
});
