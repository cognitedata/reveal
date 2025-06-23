import { assert, beforeEach, describe, expect, test } from 'vitest';
import { CylinderView } from './CylinderView';
import { LineSegments, Mesh, Object3D, PerspectiveCamera, Sprite, Vector3 } from 'three';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';
import {
  addView,
  createIntersectInput,
  expectVisibleChildren,
  expectVisibleChildrenOfType
} from '#test-utils/architecture/viewUtil';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

describe('CylinderView', () => {
  let domainObject: CylinderDomainObject;
  let view: CylinderView;
  let camera: PerspectiveCamera;

  beforeEach(() => {
    domainObject = createCylinderDomainObject();
    view = new CylinderView();
    addView(domainObject, view);

    // This force to update the labels in correct position
    camera = new PerspectiveCamera();
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    view.beforeRender(camera);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    checkChildren(view, 1, 1, 2);
  });

  test('should changed when focus change', () => {
    domainObject.setFocusInteractive(FocusType.Face);
    checkChildren(view, 1, 3, 2);

    domainObject.setFocusInteractive(FocusType.Pending);
    checkChildren(view, 1, 1, 2);

    domainObject.setFocusInteractive(FocusType.Rotation);
    checkChildren(view, 1, 3, 2);

    domainObject.setFocusInteractive(FocusType.Body);
    checkChildren(view, 1, 3, 2);

    domainObject.setFocusInteractive(FocusType.Focus);
    checkChildren(view, 1, 3, 2);

    domainObject.setFocusInteractive(FocusType.None);
    checkChildren(view, 1, 1, 2);
  });

  test('should changed when render style change', () => {
    domainObject.renderStyle.showLines = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 0, 1, 2);

    domainObject.renderStyle.showLines = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 1, 2);

    domainObject.renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 0, 2);

    domainObject.renderStyle.showSolid = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 1, 2);

    domainObject.renderStyle.showLabel = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 1, 0);
  });

  test('should changed when line width change', () => {
    checkChildren(view, 1, 1, 2);
    domainObject.renderStyle.lineWidth = 5;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 0, 1, 2, 1); // This should use the wireframe of the lineSegments
  });

  test('should changed when selection change', () => {
    domainObject.isSelected = true;
    view.update(new DomainObjectChange(Changes.selected));
    checkChildren(view, 1, 1, 2);
  });

  test('should still have labels when camera position changed to opposite direction', () => {
    domainObject.setFocusInteractive(FocusType.Focus);
    checkChildren(view, 1, 3, 2);

    // Move camera to look at the box at the opposite direction
    camera.position.negate();
    camera.lookAt(0, 0, 0);
    view.beforeRender(camera);

    // Radius labels is not visible when looking from the opposite direction
    // This changed in another PR, so the last number should be 2 when merging.
    checkChildren(view, 1, 3, 1);
  });

  test('should intersect', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    assert(intersection !== undefined);

    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, domainObject.cylinder.centerA);
    expect(intersection.customObject).toBe(view);
    expect(intersection.distanceToCamera).toBe(1);
    expect(intersection.userData).toBeInstanceOf(PrimitivePickInfo);

    if (isDomainObjectIntersection(intersection)) {
      expect(intersection.domainObject).toBe(domainObject);
    }
  });

  test('should not intersect when point is hidden', () => {
    const intersectInput = createLookingDownIntersectInput(false);
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeUndefined();
  });

  test('should not intersect when distance is greater', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, 0.5);
    expect(intersection).toBeUndefined();
  });
});

function createCylinderDomainObject(): CylinderDomainObject {
  const domainObject = new MeasureCylinderDomainObject(PrimitiveType.VerticalCylinder);
  // Vertical cylinder with center at (0,0)
  domainObject.cylinder.radius = 2;
  domainObject.cylinder.centerA.set(0, 0, 1);
  domainObject.cylinder.centerB.set(0, 0, -1);
  return domainObject;
}

function createLookingDownIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards centerA with distance 1
  const origin = new Vector3(0, 0, 2);
  const direction = new Vector3(0, 0, -1);
  return createIntersectInput(origin, direction, isVisible);
}

function checkChildren(
  view: CylinderView,
  lineSegmentCount: number,
  meshCount: number,
  spriteCount: number,
  wireframeCount: number = 0
): void {
  expectVisibleChildrenOfType(view, LineSegments, lineSegmentCount);
  expectVisibleChildrenOfType(view, Mesh, meshCount + wireframeCount); // Wireframe is also a mesh
  expectVisibleChildrenOfType(view, Sprite, spriteCount);
  expectVisibleChildrenOfType(view, Wireframe, wireframeCount);
  expectVisibleChildren(view, lineSegmentCount + meshCount + spriteCount + wireframeCount);
}
