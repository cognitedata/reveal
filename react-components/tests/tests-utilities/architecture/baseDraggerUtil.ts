import { Changes } from '../../../src/architecture/base/domainObjectsHelpers/Changes';
import { EventChangeTester } from './EventChangeTester';
import { expect } from 'vitest';
import { Mock } from 'moq.ts';
import { PrimitivePickInfo } from '../../../src/architecture/concrete/primitives/common/PrimitivePickInfo';
import { Ray, Vector3 } from 'three';
import { type BaseDragger } from '../../../src/architecture/base/domainObjectsHelpers/BaseDragger';
import { BoxFace } from '../../../src/architecture/concrete/primitives/common/BoxFace';
import { type DomainObject } from '../../../src/architecture/base/domainObjects/DomainObject';
import { type DomainObjectIntersection } from '../../../src/architecture/base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../../src/architecture/base/domainObjectsHelpers/FocusType';
import { type ICustomObject } from '@cognite/reveal';

export type TestCase = { expectedChange: boolean; shiftKey: boolean };

export function* getTestCases(): Generator<TestCase> {
  yield { expectedChange: true, shiftKey: false };
  yield { expectedChange: true, shiftKey: true };
  yield { expectedChange: false, shiftKey: false };
}

export function* getTestCasesWithSign(): Generator<TestCase & { sign: -1 | 1 }> {
  yield { expectedChange: true, shiftKey: false, sign: 1 };
  yield { expectedChange: true, shiftKey: false, sign: -1 };
  yield { expectedChange: true, shiftKey: true, sign: 1 };
  yield { expectedChange: true, shiftKey: true, sign: -1 };
  yield { expectedChange: false, shiftKey: false, sign: 1 };
}

export function drag(
  dragger: BaseDragger,
  startRay: Ray,
  delta: Vector3,
  testCase: TestCase,
  expectedFocusChange = true
): void {
  const draggerTester = new EventChangeTester(dragger.domainObject, Changes.dragging);
  const focusTester = new EventChangeTester(dragger.domainObject, Changes.focus);
  const { expectedChange, shiftKey } = testCase;

  const endRay = new Ray(startRay.origin.clone().add(delta), startRay.direction.clone());
  dragger.onPointerDown(new PointerEvent('pointerdown', { shiftKey }));
  const actualChanged = dragger.onPointerDrag(
    new PointerEvent('pointermove', { shiftKey }),
    endRay
  );
  dragger.onPointerUp(new PointerEvent('pointermove', { shiftKey }));
  expect(actualChanged).toBe(expectedChange);

  // Test of notifications has happened
  draggerTester.toHaveBeenCalledTimes(expectedChange ? 1 : 0);
  focusTester.toHaveBeenCalledTimes(expectedFocusChange ? 1 : 0);
  if (expectedChange) {
    expect(dragger.transaction).toBeDefined();
  }
}

export function createIntersectionMock(
  domainObject: DomainObject,
  focusType: FocusType = FocusType.None,
  faceIndex: number = 0,
  cornerSign?: Vector3
): DomainObjectIntersection {
  const userdata =
    focusType !== FocusType.None
      ? new PrimitivePickInfo(new BoxFace(faceIndex), focusType, cornerSign)
      : undefined;

  return {
    type: 'customObject',
    domainObject,
    userData: userdata,
    point: new Vector3(), // This is not used by the dragger
    distanceToCamera: 0, // This is not used by the dragger
    customObject: new Mock<ICustomObject>().object() // This is not used by the dragger
  };
}
