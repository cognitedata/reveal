import { assert, describe, expect, test } from 'vitest';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { Ray, Sphere, Vector3 } from 'three';
import {
  createIntersectionMock,
  drag,
  getTestCasesWithSign
} from '#test-utils/architecture/baseDraggerUtil';
import { PointDragger } from './PointDragger';
import { type PointDomainObject } from './PointDomainObject';
import { type PointRenderStyle } from './PointRenderStyle';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { MeasurePointDomainObject } from '../../measurements/MeasurePointDomainObject';

describe(PointDragger.name, () => {
  test('translate the example', () => {
    // Grab the example point and move it to the side
    for (const testCase of getTestCasesWithSign()) {
      const domainObject = createPointDomainObject();
      const direction = new Vector3(-1, 0, 0); // Look along negative X axis
      const origin = domainObject.point.clone().addScaledVector(direction, -6);
      const startRay = new Ray(origin, direction);
      const delta = new Vector3();

      const expectedCenter = domainObject.point.clone();
      if (testCase.expectedChange) {
        delta.set(0, testCase.sign, testCase.sign);
        expectedCenter.add(delta);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay)
      );
      assert(dragger !== undefined);
      expect(dragger).instanceOf(PointDragger);
      drag(dragger, startRay, delta, testCase, false);
      expectEqualVector3(domainObject.point, expectedCenter);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: PointDomainObject,
  ray: Ray
): CreateDraggerProps {
  const style = domainObject.getRenderStyle() as PointRenderStyle;
  const center = domainObject.point.clone();
  const sphere = new Sphere(center, style.radius);
  const point = ray.intersectSphere(sphere, new Vector3());
  if (point === null) {
    throw new Error('No intersection found for the ray and object');
  }
  const intersection = createIntersectionMock(domainObject);
  return { intersection, point, ray };
}

function createPointDomainObject(): PointDomainObject {
  const domainObject = new MeasurePointDomainObject();
  domainObject.point.set(1, 2, 3);
  return domainObject;
}
