/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';

export class MeasurementGizmo {
  private readonly _viewer: Cognite3DViewer;
  private _mesh: THREE.Mesh;

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
  }

  /**
   * Adds a Gizmo/Sphere at specified position
   * @param position Gizmo position
   */
  add(position: THREE.Vector3): void {
    this._mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.01),
      new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true })
    );
    this._mesh.position.copy(position);

    this._viewer.addObject3D(this._mesh);
  }

  /**
   * Remove Gizmo/Sphere
   */
  remove(): void {
    this._viewer.removeObject3D(this._mesh);
  }
}
