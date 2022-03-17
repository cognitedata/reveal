/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';

export class MeasurementGizmo {
  private readonly _viewer: Cognite3DViewer;
  private readonly _controlPoints: THREE.Vector3[];

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
  }

  addControlPoint(point: THREE.Vector3): void {
    this._controlPoints.push(point);
  }

  add(mesh: THREE.Mesh): void {
    const geometry = mesh.geometry;

    const boundingSphere = geometry.boundingSphere.clone();

    mesh.rotateX(-Math.PI / 2);
    mesh.updateMatrixWorld();
    this._viewer.addObject3D(mesh);

    const center = mesh.localToWorld(boundingSphere.center);
    // scope.controls.target.copy(center);
    // scope.controls.minDistance = boundingSphere.radius * 0.5;
    // scope.controls.maxDistance = boundingSphere.radius * 3;

    // camera.position.set(0, 0, boundingSphere.radius * 2).add(center);
    // camera.lookAt(center);
  }
}
