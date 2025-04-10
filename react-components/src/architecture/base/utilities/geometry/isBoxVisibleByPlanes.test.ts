/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { Box3, Vector3, Plane } from 'three';
import { isEntireBoxVisibleByPlanes, isAnyCornersVisibleByPlanes } from './isBoxVisibleByPlanes';
import { type Range3 } from './Range3';

const min = new Vector3(100, 200, 300);
const max = new Vector3(400, 600, 800);
const box = new Box3(min, max);

describe(isBoxVisibleByPlanes.name, () => {
  test('should test with no planes', () => {
    const planes: Plane[] = [];
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(true);
    expect(isAnyCornersVisibleByPlanes(planes, box)).toBe(true);
  });

  test('should test with box entirely inside only', () => {
    const largerBox = box.clone();
    largerBox.expandByScalar(1);
    const planes = createPlanesAtTheEdgesOfBox(largerBox);
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(true);
    expect(isAnyCornersVisibleByPlanes(planes, box)).toBe(true);
  });

  test('should test with box entirely outside only', () => {
    const largerBox = box.clone();
    largerBox.expandByScalar(-1);
    const planes = createPlanesAtTheEdgesOfBox(largerBox);
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(false);
    expect(isAnyCornersVisibleByPlanes(planes, box)).toBe(false);
  });

  test('should test with a box that is partly visible', () => {
    const smallerBox = box.clone();
    const translation = smallerBox.getSize(new Vector3().divideScalar(2));
    smallerBox.translate(translation);
    const planes = createPlanesAtTheEdgesOfBox(smallerBox);
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(false);
    expect(isAnyCornersVisibleByPlanes(planes, box)).toBe(true);
  });
});

export function createPlanesAtTheEdgesOfBox(
  boundingBox: Range3 | Box3,
  vertical = true,
  horizontally = true
): Plane[] {
  const min = boundingBox.min;
  const max = boundingBox.max;
  const center = boundingBox.getCenter(new Vector3());
  const planes = new Array<Plane>();

  if (vertical) {
    planes.push(createPlane(new Vector3(1, 0, 0), new Vector3(min.x, 0, 0)));
    planes.push(createPlane(new Vector3(1, 0, 0), new Vector3(max.x, 0, 0)));
    planes.push(createPlane(new Vector3(0, 1, 0), new Vector3(0, min.y, 0)));
    planes.push(createPlane(new Vector3(0, 1, 0), new Vector3(0, max.y, 0)));
  }
  if (horizontally) {
    planes.push(createPlane(new Vector3(0, 0, 1), new Vector3(0, 0, min.z)));
    planes.push(createPlane(new Vector3(0, 0, 1), new Vector3(0, 0, max.z)));
  }
  for (let index = 0; index < planes.length; index++) {
    const plane = planes[index];
    if (plane.distanceToPoint(center) < 0) {
      planes[index] = plane.negate();
    }
  }
  return planes;
}

function createPlane(normal: Vector3, point: Vector3): Plane {
  return new Plane().setFromNormalAndCoplanarPoint(normal, point);
}
