import { assert, beforeEach, describe, expect, test } from 'vitest';
import { Mesh, Object3D, Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import {
  addView,
  createIntersectInput,
  expectChildrenLength
} from '#test-utils/architecture/viewUtil';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { ExampleView } from './ExampleView';
import { type ExampleDomainObject } from './ExampleDomainObject';
import { createExampleDomainObject } from './testUtilities';

describe(ExampleView.name, () => {
  let domainObject: ExampleDomainObject;
  let view: ExampleView;

  beforeEach(() => {
    domainObject = createExampleDomainObject();
    view = new ExampleView();
    addView(domainObject, view);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenLength(view, 1);
    expect(view.object.children[0]).instanceOf(Mesh);
  });

  test('should regenerate when render style change', () => {
    const style = domainObject.renderStyle;
    const oldRadius = view.boundingBox.getSize(new Vector3()).z / 2;
    const child = view.object.children[0];
    expect(oldRadius).toBeCloseTo(style.radius);

    // Double the radius
    style.radius *= 2;
    view.update(new DomainObjectChange(Changes.renderStyle));

    const newRadius = view.boundingBox.getSize(new Vector3()).z / 2;
    expect(newRadius).toBeCloseTo(style.radius);
    expect(newRadius).not.toBeCloseTo(oldRadius);
    expect(view.object.children[0]).not.toBe(child); // Check that there is a new mesh
  });

  test('should changed when selection change', () => {
    const child = view.object.children[0];
    domainObject.setSelectedInteractive(true);
    expect(view.object.children[0]).not.toBe(child); // Check that there is a new mesh
  });

  test('should intersect', () => {
    const expectedIntersection = getExpectedIntersection(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedIntersection);

    const intersection = view.intersectIfCloser(intersectInput, undefined);

    expect(intersection).toBeDefined();
    assert(intersection !== undefined);

    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, expectedIntersection);
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);

    if (isDomainObjectIntersection(intersection)) {
      expect(intersection.domainObject).toBe(domainObject);
    }
  });

  test('should not intersect when point is hidden', () => {
    const expectedIntersection = getExpectedIntersection(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedIntersection, false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when distance is greater', () => {
    const expectedIntersection = getExpectedIntersection(domainObject);
    const intersectInput = createLookingDownIntersectInput(expectedIntersection);
    const intersection = view.intersectIfCloser(intersectInput, 0.5);
    expect(intersection).toBeUndefined();
  });
});

const DOWN = new Vector3(0, 0, -1);

function getExpectedIntersection(domainObject: ExampleDomainObject): Vector3 {
  const style = domainObject.renderStyle;
  return domainObject.center.clone().addScaledVector(DOWN, -style.radius);
}

function createLookingDownIntersectInput(
  expectedIntersection: Vector3,
  isVisible = true
): CustomObjectIntersectInput {
  const origin = expectedIntersection.clone().addScaledVector(DOWN, -1);
  return createIntersectInput(origin, DOWN, isVisible);
}
