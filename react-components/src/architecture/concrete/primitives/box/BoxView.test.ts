import { assert, beforeEach, describe, expect, test } from 'vitest';
import { BoxView } from './BoxView';
import { LineSegments, Mesh, Object3D, PerspectiveCamera, Sprite, Vector3 } from 'three';
import { type BoxDomainObject } from './BoxDomainObject';
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
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BoxFace } from '../common/BoxFace';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';

describe(BoxView.name, () => {
  let domainObject: BoxDomainObject;
  let view: BoxView;
  let camera: PerspectiveCamera;

  beforeEach(() => {
    domainObject = createBoxDomainObject();
    view = new BoxView();
    addView(domainObject, view);

    // This force to update the labels in correct position
    camera = new PerspectiveCamera();
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    view.beforeRender(camera);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    checkChildren(view, 1, 1, 3);
  });

  test('should changed when focus change', () => {
    const face = new BoxFace(1);

    domainObject.setFocusInteractive(FocusType.Face, face);
    checkChildren(view, 1, 9, 3);

    domainObject.setFocusInteractive(FocusType.Pending);
    checkChildren(view, 1, 1, 4);

    domainObject.setFocusInteractive(FocusType.Rotation, face);
    checkChildren(view, 1, 9, 3);

    domainObject.setFocusInteractive(FocusType.Body, face);
    checkChildren(view, 1, 9, 3);

    domainObject.setFocusInteractive(FocusType.Focus);
    checkChildren(view, 1, 9, 3);

    domainObject.setFocusInteractive(FocusType.None);
    checkChildren(view, 1, 1, 3);
  });

  test('should changed when render style change', () => {
    domainObject.renderStyle.showLines = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 0, 1, 3);

    domainObject.renderStyle.showLines = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 1, 3);

    domainObject.renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 0, 3);

    domainObject.renderStyle.showSolid = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 1, 3);

    domainObject.renderStyle.showLabel = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 1, 1, 0);
  });

  test('should changed when line width change', () => {
    checkChildren(view, 1, 1, 3);
    domainObject.renderStyle.lineWidth = 5;
    view.update(new DomainObjectChange(Changes.renderStyle));
    checkChildren(view, 0, 1, 3, 1); // This should use the wireframe of the lineSegments
  });

  test('should changed when selection change', () => {
    domainObject.isSelected = true;
    view.update(new DomainObjectChange(Changes.selected));
    checkChildren(view, 1, 1, 3);
  });

  test('should still have 3 labels when camera position changed to opposite direction', () => {
    domainObject.setFocusInteractive(FocusType.Focus);
    checkChildren(view, 1, 9, 3);

    // Move camera to look at the box at the opposite direction
    camera.position.negate();
    camera.lookAt(0, 0, 0);
    view.beforeRender(camera);
    checkChildren(view, 1, 9, 3);
  });

  test('should intersect', () => {
    const intersectInput = createLookingDownIntersectInput();
    const intersection = view.intersectIfCloser(intersectInput, undefined);
    expect(intersection).toBeDefined();
    assert(intersection !== undefined);

    intersection.point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.invert());
    expectEqualVector3(intersection.point, new Vector3(0, 0, 1));
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

function createBoxDomainObject(): BoxDomainObject {
  const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
  domainObject.box.size.set(2, 2, 2);
  domainObject.box.center.set(0, 0, 0);
  return domainObject;
}

function createLookingDownIntersectInput(isVisible = true): CustomObjectIntersectInput {
  // Looking down towards center with distance 1
  const origin = new Vector3(0, 0, 2);
  const direction = new Vector3(0, 0, -1);
  return createIntersectInput(origin, direction, isVisible);
}

function checkChildren(
  view: BoxView,
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
