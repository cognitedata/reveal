/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import THREE from 'three';

export class MeasurementDistance {
  private readonly _controlPoints: THREE.Vector3[];
  private readonly _viewer: Cognite3DViewer;
  
  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
  }

  handleGizmos = {
    START: [
      new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.4 }))
    ],
    END: [new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.4 }))],
    TOPLINE: [
      new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 4, 1, false),
        new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.4 })
      ),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(Math.PI / 2, 0, 0)
    ],
    STARTLINE: [
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1, 4, 1, false),
        new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.1 })
      ),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(Math.PI / 2, 0, 0)
    ],
    ENDLINE: [
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1, 4, 1, false),
        new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.1 })
      ),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(Math.PI / 2, 0, 0)
    ]
  };

  public addControlPoints(controlPoint: THREE.Vector3): void {
    this._controlPoints.push(controlPoint);
  }

  public clearControlPoints(): void {
    this._controlPoints.splice(0);
  }

  public updateGizmoWithControlPoints(): void {

    if (this._controlPoints.length === 1) {
      const mesh = this.handleGizmos.START[0];
      mesh.position.copy(this._controlPoints[0]);
      this._viewer.addObject3D(mesh);
    } else if (this._controlPoints.length === 2) {
      const mesh = this.handleGizmos.END[0];
      mesh.position.copy(this._controlPoints[1]);
      this._viewer.addObject3D(mesh);
    }
  }
}
