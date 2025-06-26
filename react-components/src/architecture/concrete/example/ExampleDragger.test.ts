import { assert, describe, expect, test } from 'vitest';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import { Ray, Sphere, Vector3 } from 'three';
import { type CreateDraggerProps } from '../../base/domainObjects/VisualDomainObject';
import {
  createIntersectionMock,
  drag,
  getTestCasesWithSign
} from '#test-utils/architecture/baseDraggerUtil';
import { ExampleDragger } from './ExampleDragger';
import { createExampleDomainObject } from './testUtilities';
import { type ExampleDomainObject } from './ExampleDomainObject';
import { type ExampleRenderStyle } from './ExampleRenderStyle';

describe(ExampleDragger.name, () => {
  test('translate the example', () => {
    // Grab the example point and move it to the side
    for (const testCase of getTestCasesWithSign()) {
      const domainObject = createExampleDomainObject();
      const direction = new Vector3(-1, 0, 0); // Look along negative X axis
      const origin = domainObject.center.clone().addScaledVector(direction, -6);
      const startRay = new Ray(origin, direction);
      const delta = new Vector3();

      const expectedCenter = domainObject.center.clone();
      if (testCase.expectedChange) {
        delta.set(0, testCase.sign, testCase.sign);
        expectedCenter.add(delta);
      }
      const dragger = domainObject.createDragger(
        createCreateDraggerPropsMock(domainObject, startRay)
      );
      assert(dragger !== undefined);
      expect(dragger).instanceOf(ExampleDragger);
      drag(dragger, startRay, delta, testCase, false);
      expectEqualVector3(domainObject.center, expectedCenter);
    }
  });
});

function createCreateDraggerPropsMock(
  domainObject: ExampleDomainObject,
  ray: Ray
): CreateDraggerProps {
  const style = domainObject.getRenderStyle() as ExampleRenderStyle;
  const center = domainObject.center.clone();
  const sphere = new Sphere(center, style.radius);
  const point = ray.intersectSphere(sphere, new Vector3());
  if (point === null) {
    throw new Error('No intersection found for the ray and object');
  }
  const intersection = createIntersectionMock(domainObject);
  return { intersection, point, ray };
}
