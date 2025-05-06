/*!
 * Copyright 2025 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { Box3, Line, Mesh, Object3D, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { PlaneView } from './PlaneView';
import { type PlaneDomainObject } from './PlaneDomainObject';

import {
  addView,
  createIntersectInput,
  expectChildrenLength,
  expectChildrenOfTypeAndCount
} from '#test-utils/architecture/viewUtil';
import { createPlaneDomainObjectMock } from './PlaneDomainObject.test';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

describe(PlaneView.name, () => {
  let domainObject: PlaneDomainObject;
  let view: PlaneView;

  beforeEach(() => {
    const renderTarget = createFullRenderTargetMock();
    const root = renderTarget.rootDomainObject;

    renderTarget.viewer.getSceneBoundingBox = () => {
      return new Box3(new Vector3(), new Vector3()).expandByScalar(100);
    };

    domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);
    root.addChild(domainObject);
    view = new PlaneView();
    addView(domainObject, view);
  });

  test('should have object and children of Line and Mesh when not selected', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenLength(view, 3);
    expectChildrenOfTypeAndCount(view, Line, 1);
    expectChildrenOfTypeAndCount(view, Mesh, 2);
  });

  test('should have object and children of Wireframe and Mesh when selected', () => {
    domainObject.setSelectedInteractive(true);
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenLength(view, 3);
    expectChildrenOfTypeAndCount(view, Wireframe, 1);
    expectChildrenOfTypeAndCount(view, Mesh, 3); // Wireframe is also a mesh
  });

  test('should intersect', () => {
    const expectedPoint = getExpectedPoint(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedPoint);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    if (intersection === undefined) {
      return;
    }
    const actualPoint = intersection.point;
    actualPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(actualPoint, expectedPoint);
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);

    if (isDomainObjectIntersection(intersection)) {
      expect(intersection.domainObject).toBe(domainObject);
    }
  });

  test('should not intersect when outside', () => {
    const expectedPoint = getExpectedPoint(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedPoint, false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when point is hidden', () => {
    const expectedPoint = getExpectedPoint(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedPoint, false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when distance is greater', () => {
    const expectedPoint = getExpectedPoint(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedPoint);
    const intersection = view.intersectIfCloser(intersectInput, 0.5);
    expect(intersection).toBeUndefined();
  });
});

function createLookingDownIntersectInput(
  expectedPoint: Vector3,
  isVisible = true
): CustomObjectIntersectInput {
  // Looking down towards expectedPoint with distance 1
  const direction = new Vector3(0, 0, -1);
  const origin = expectedPoint.clone().addScaledVector(direction, -1);
  return createIntersectInput(origin, direction, isVisible);
}

function getExpectedPoint(domainObject: PlaneDomainObject): Vector3 {
  const origin = new Vector3(0, 0, 0);
  return domainObject.plane.projectPoint(origin, new Vector3());
}
