/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export class BoundingBoxClipper {
  private readonly _box: THREE.Box3;
  private readonly _clippingPlanes: THREE.Plane[] = [
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane()
  ];

  constructor(box?: THREE.Box3) {
    this._box = box || new THREE.Box3();
    this.updatePlanes();
  }

  set minX(x: number) {
    this._box.min.x = x;
    this.updatePlanes();
  }

  get minX(): number {
    return this._box.min.x;
  }

  set minY(y: number) {
    this._box.min.y = y;
    this.updatePlanes();
  }

  get minY(): number {
    return this._box.min.y;
  }

  set minZ(z: number) {
    this._box.min.z = z;
    this.updatePlanes();
  }

  get minZ(): number {
    return this._box.min.z;
  }

  set maxX(x: number) {
    this._box.max.x = x;
    this.updatePlanes();
  }

  get maxX(): number {
    return this._box.max.x;
  }

  set maxY(y: number) {
    this._box.max.y = y;
    this.updatePlanes();
  }

  get maxY(): number {
    return this._box.max.y;
  }

  set maxZ(z: number) {
    this._box.max.z = z;
    this.updatePlanes();
  }

  get maxZ(): number {
    return this._box.max.z;
  }

  private updatePlanes() {
    this._clippingPlanes[0].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(this.minX, 0, 0)
    );
    this._clippingPlanes[1].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(this.maxX, 0, 0)
    );
    this._clippingPlanes[2].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, this.minY, 0)
    );
    this._clippingPlanes[3].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, this.maxY, 0)
    );
    this._clippingPlanes[4].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, this.minZ)
    );
    this._clippingPlanes[5].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, this.maxZ)
    );
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._clippingPlanes;
  }
}
