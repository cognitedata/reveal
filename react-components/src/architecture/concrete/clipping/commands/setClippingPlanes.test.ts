import { describe, expect, test } from 'vitest';
import { SliceDomainObject } from '../SliceDomainObject';
import { createFullRenderTargetMock } from '#test-utils//fixtures/createFullRenderTargetMock';
import { ClipFolder } from '../ClipFolder';
import { PlanePrimitiveTypes } from '../../../base/utilities/primitives/PrimitiveType';
import { setClippingPlanes } from './setClippingPlanes';

describe(setClippingPlanes.name, () => {
  test('Should set global clipping planes', () => {
    const renderTarget = createFullRenderTargetMock();
    const root = renderTarget.rootDomainObject;

    // Add some planes to the root
    const folder = new ClipFolder();
    root.addChild(folder);
    for (const primitiveType of PlanePrimitiveTypes) {
      const domainObject = new SliceDomainObject(primitiveType);
      folder.addChild(domainObject);
    }
    setClippingPlanes(root);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(PlanePrimitiveTypes.length);
  });

  test('Should set global clipping planes to none planes', () => {
    const renderTarget = createFullRenderTargetMock();
    const root = renderTarget.rootDomainObject;
    setClippingPlanes(root);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(0);
  });
});
