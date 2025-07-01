import { describe, expect, test } from 'vitest';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { type Plane, Vector3 } from 'three';
import { setClippingPlanes } from './commands/setClippingPlanes';
import { SliceDomainObject } from './SliceDomainObject';
import { PlanePrimitiveTypes, PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { isGreyScale } from '../../base/utilities/colors/colorExtensions';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

describe(SliceDomainObject.name, () => {
  test('Should be initialized', () => {
    for (const primitiveType of PlanePrimitiveTypes) {
      const domainObject = new SliceDomainObject(primitiveType);
      expect(isGreyScale(domainObject.color)).toBe(false);
      expect(isGreyScale(domainObject.backSideColor)).toBe(false);
      expect(isEmpty(domainObject.typeName)).toBe(false);
      expect(domainObject.getPanelToolbar().length).toBe(4);
      expect(domainObject.useClippingInIntersection).toBe(false);
    }
  });

  test('Should be cloned', () => {
    for (const primitiveType of PlanePrimitiveTypes) {
      const domainObject = new SliceDomainObject(primitiveType);
      const clone = domainObject.clone();

      expect(clone).toBeInstanceOf(SliceDomainObject);
      expect(clone).not.toBe(domainObject);
      if (!(clone instanceof SliceDomainObject)) {
        return;
      }
      expect(clone.primitiveType).toStrictEqual(domainObject.primitiveType);
      expect(clone.plane).toStrictEqual(domainObject.plane);
      expect(clone.color).toStrictEqual(domainObject.color);
      expect(clone.backSideColor).toStrictEqual(domainObject.backSideColor);
      expect(clone.uniqueId).toBe(domainObject.uniqueId);
      expect(clone.name).toBe(domainObject.name);
      expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
    }
  });

  test('Should set SliceDomainObject as clipping planes', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createHorizontalPlane();
    renderTarget.rootDomainObject.addChild(domainObject);

    // Set the SliceDomainObject as the global clipping planes
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(0);
    setClippingPlanes(renderTarget.rootDomainObject);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(1);
    expect(renderTarget.getGlobalClippingPlanes()[0]).toStrictEqual(
      getPlaneInViewerCoords(domainObject)
    );
  });

  test('Should remove global clipping planes when SliceDomainObject is removed', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createHorizontalPlane();
    renderTarget.rootDomainObject.addChild(domainObject);

    // Set the SliceDomainObject as the global clipping planes
    setClippingPlanes(renderTarget.rootDomainObject);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(1);

    // Remove SliceDomainObject and check if the global clipping planes are empty
    domainObject.removeInteractive(false);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(0);
  });

  test('Should change the global clipping planes when active SliceDomainObject change the geometry', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createHorizontalPlane();
    renderTarget.rootDomainObject.addChild(domainObject);

    setClippingPlanes(renderTarget.rootDomainObject);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(1);
    domainObject.plane.translate(new Vector3(1, 2, 3));
    domainObject.notify(Changes.geometry);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(1);
    expect(renderTarget.getGlobalClippingPlanes()[0]).toStrictEqual(
      getPlaneInViewerCoords(domainObject)
    );
  });

  test('Should not change the global clipping planes when not active SliceDomainObject change the geometry', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createHorizontalPlane();
    renderTarget.rootDomainObject.addChild(domainObject);

    expect(renderTarget.getGlobalClippingPlanes().length).toBe(0);
    domainObject.notify(Changes.geometry);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(0);
  });
});

function createHorizontalPlane(): SliceDomainObject {
  const domainObject = new SliceDomainObject(PrimitiveType.PlaneZ);
  domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), new Vector3(5, 6, 7));
  return domainObject;
}

function getPlaneInViewerCoords(domainObject: SliceDomainObject): Plane {
  const plane = domainObject.plane.clone();
  plane.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  return plane;
}
