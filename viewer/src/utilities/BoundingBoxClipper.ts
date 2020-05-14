/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export class BoundingBoxClipper {
  private _intersection: boolean;
  private readonly _box: THREE.Box3;
  private readonly _clippingPlanes: THREE.Plane[] = [
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane()
  ];

  constructor(box?: THREE.Box3, intersection?: boolean) {
    this._box = box || new THREE.Box3();
    this._intersection = intersection || false;
    this.updatePlanes();
  }

  set minX(x: number) {
    this._box.min.x = x;
    this.updatePlanes();
  }

  get minX() {
    return this._box.min.x;
  }

  set minY(y: number) {
    this._box.min.y = y;
    this.updatePlanes();
  }

  get minY() {
    return this._box.min.y;
  }

  set minZ(z: number) {
    this._box.min.z = z;
    this.updatePlanes();
  }

  get minZ() {
    return this._box.min.z;
  }

  set maxX(x: number) {
    this._box.max.x = x;
    this.updatePlanes();
  }

  get maxX() {
    return this._box.max.x;
  }

  set maxY(y: number) {
    this._box.max.y = y;
    this.updatePlanes();
  }

  get maxY() {
    return this._box.max.y;
  }

  set maxZ(z: number) {
    this._box.max.z = z;
    this.updatePlanes();
  }

  get maxZ() {
    return this._box.max.z;
  }

  set intersection(value: boolean) {
    this._intersection = value;
    this.updatePlanes();
  }

  get intersection() {
    return this._intersection;
  }

  private updatePlanes() {
    this._clippingPlanes[0].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(this.intersection ? -1 : 1, 0, 0),
      new THREE.Vector3(this.minX, 0, 0)
    );
    this._clippingPlanes[1].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(this.intersection ? 1 : -1, 0, 0),
      new THREE.Vector3(this.maxX, 0, 0)
    );
    this._clippingPlanes[2].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, this.intersection ? -1 : 1, 0),
      new THREE.Vector3(0, this.minY, 0)
    );
    this._clippingPlanes[3].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, this.intersection ? 1 : -1, 0),
      new THREE.Vector3(0, this.maxY, 0)
    );
    this._clippingPlanes[4].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, this.intersection ? -1 : 1),
      new THREE.Vector3(0, 0, this.minZ)
    );
    this._clippingPlanes[5].setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, this.intersection ? 1 : -1),
      new THREE.Vector3(0, 0, this.maxZ)
    );
  }

  get clippingPlanes() {
    return this._clippingPlanes;
  }
}
