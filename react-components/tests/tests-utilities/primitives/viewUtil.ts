/*!
 * Copyright 2025 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersectInput } from '@cognite/reveal';
import { type DomainObject, type ThreeView } from '../../../src/architecture';
import { createFullRenderTargetMock } from '../fixtures/createFullRenderTargetMock';
import { PerspectiveCamera, Raycaster, Vector2, type Vector3 } from 'three';

export function addView(domainObject: DomainObject, view: ThreeView): void {
  const renderTarget = createFullRenderTargetMock();
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
