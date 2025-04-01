/*!
 * Copyright 2025 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { Object3D, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { LineView } from './LineView';
import { type LineDomainObject } from './LineDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';

import {
  addView,
  createIntersectInput,
  expectChildrenLength
} from '#test-utils/architecture/viewUtil';
import { MeasureLineDomainObject } from '../../measurements/MeasureLineDomainObject';

describe('LineView', () => {
  let domainObject: LineDomainObject;
  let view: LineView;

  beforeEach(() => {
    domainObject = createLineDomainObject();
    view = new LineView();
    addView(domainObject, view);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenLength(view, 2);
  });

  test('should intersect', () => {
    const points = [
      domainObject.firstPoint,
      domainObject.lastPoint,
      getMiddlePoint(domainObject),
      getPointAtFirstLineSegment(domainObject),
      getPointAtLastLineSegment(domainObject)
    ];
    for (const expectedPoint of points) {
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
    }
  });

  test('should not intersect when outside', () => {
    const expectedPoint = new Vector3(0, 0, 0);
    const intersectInput = createLookingDownIntersectInput(expectedPoint, false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when point is hidden', () => {
    const expectedPoint = getPointAtFirstLineSegment(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedPoint, false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when distance is greater', () => {
    const expectedPoint = getPointAtFirstLineSegment(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedPoint);
    const intersection = view.intersectIfCloser(intersectInput, 0.5);
    expect(intersection).toBeUndefined();
  });
});

function getPointAtFirstLineSegment(domainObject: LineDomainObject): Vector3 {
  const { points } = domainObject;
  const point = points[0].clone();
  point.add(points[1]);
  point.divideScalar(2);
  return point;
}

function getPointAtLastLineSegment(domainObject: LineDomainObject): Vector3 {
  const point = domainObject.firstPoint.clone();
  point.add(domainObject.lastPoint);
  point.divideScalar(2);
  return point;
}

function getMiddlePoint(domainObject: LineDomainObject): Vector3 {
  const { points } = domainObject;
  return points[points.length / 2].clone();
}

function createLookingDownIntersectInput(
  expectedPoint: Vector3,
  isVisible = true
): CustomObjectIntersectInput {
  // Looking down towards expectedPoint with distance 1
  const direction = new Vector3(0, 0, -1);
  const origin = expectedPoint.clone().addScaledVector(direction, -1);
  return createIntersectInput(origin, direction, isVisible);
}

export function createLineDomainObject(): LineDomainObject {
  const domainObject = new MeasureLineDomainObject(PrimitiveType.Polygon);
  domainObject.points.push(new Vector3(0, 0, 0));
  domainObject.points.push(new Vector3(1, 0, 0));
  domainObject.points.push(new Vector3(1, 1, 0));
  domainObject.points.push(new Vector3(0, 1, 0));
  for (const point of domainObject.points) {
    point.x *= 2;
    point.y *= 2;
    point.x += 14.245;
    point.y += 51.562;
    point.z += 23.951;
  }
  return domainObject;
}
