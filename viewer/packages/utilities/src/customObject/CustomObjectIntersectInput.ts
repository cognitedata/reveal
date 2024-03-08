/*!
 * Copyright 2024 Cognite AS
 */

import { Raycaster, Vector3, Vector2, PerspectiveCamera, Plane } from 'three';
import { isPointVisibleByPlanes } from '../three/isPointVisibleByPlanes';

/**
 * This class is used as input for intersecting custom objects
 * @beta
 */
export class CustomObjectIntersectInput {
  readonly normalizedCoords: Vector2;
  readonly camera: PerspectiveCamera;
  readonly clippingPlanes: Plane[] | undefined;
  readonly raycaster = new Raycaster();

  constructor(normalizedCoords: Vector2, camera: PerspectiveCamera, clippingPlanes: Plane[] | undefined = undefined) {
    this.normalizedCoords = normalizedCoords;
    this.camera = camera;
    this.clippingPlanes = clippingPlanes;
    this.raycaster.setFromCamera(normalizedCoords, this.camera);
  }

  public isVisible(point: Vector3): boolean {
    return this.clippingPlanes === undefined || isPointVisibleByPlanes(this.clippingPlanes, point);
  }
}
