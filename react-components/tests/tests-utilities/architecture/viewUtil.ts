import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { type GroupThreeView, type DomainObject, type ThreeView } from '../../../src/architecture';
import { createFullRenderTargetMock } from '../fixtures/createFullRenderTargetMock';
import { PerspectiveCamera, Raycaster, Vector2, type Vector3 } from 'three';
import { expect } from 'vitest';
import { getRenderTarget } from '../../../src/architecture/base/domainObjects/getRoot';
import { count } from '../../../src/architecture/base/utilities/extensions/arrayUtils';
import { type Class } from '../../../src/architecture/base/domainObjectsHelpers/Class';

export function expectChildrenLength(view: GroupThreeView, expectedLength: number): void {
  expect(view.object.children.length).toBe(expectedLength);
}

export function expectChildrenOfTypeAndCount<T>(
  view: GroupThreeView,
  classType: Class<T>,
  expectedCount: number
): void {
  const actualCount = count(view.object.children, (child) => child instanceof classType);
  expect(actualCount, 'Expect ' + expectedCount + ' ' + classType.name).toBe(expectedCount);
}

export function expectVisibleChildren(view: GroupThreeView, expectedCount: number): void {
  const actualCount = count(view.object.children, (child) => child.visible);
  expect(actualCount).toBe(expectedCount);
}

export function expectVisibleChildrenOfType<T>(
  view: GroupThreeView,
  classType: Class<T>,
  expectedCount: number
): void {
  const actualCount = count(
    view.object.children,
    (child) => child.visible && child instanceof classType
  );
  expect(actualCount, 'Expect ' + expectedCount + ' ' + classType.name).toBe(expectedCount);
}

export function addView(domainObject: DomainObject, view: ThreeView): void {
  const renderTarget = getRenderTarget(domainObject) ?? createFullRenderTargetMock();
  view.attach(domainObject, renderTarget);
  view.initialize();
  view.onShow();
  domainObject.views.addView(view);
}

export function createIntersectInput(
  origin: Vector3,
  direction: Vector3,
  isVisible = true
): CustomObjectIntersectInput {
  direction.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  origin.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

  const raycaster = new Raycaster(origin, direction);
  const customObjectIntersectInputMock: CustomObjectIntersectInput = {
    raycaster,
    isVisible: (_point: Vector3) => isVisible,
    clippingPlanes: undefined,

    // This is not used in this test
    normalizedCoords: new Vector2(),
    camera: new PerspectiveCamera()
  };
  return customObjectIntersectInputMock;
}
