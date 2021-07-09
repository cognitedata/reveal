/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

const emptyGeometry = new THREE.BufferGeometry();

/**
 * Referenced count implementation of THREE.Group that
 * automatically disposes all geometries contained in meshes that
 * are direct children of the group.
 */
export class AutoDisposeGroup extends THREE.Group {
  private _isDisposed = false;
  private _referenceCount = 0;

  reference(): void {
    this.ensureNotDisposed();
    this._referenceCount++;
  }

  dereference(): void {
    this.ensureNotDisposed();
    if (this._referenceCount === 0) {
      throw new Error('No references');
    }
    if (--this._referenceCount === 0) {
      this.dispose();
    }
  }

  private dispose(): void {
    this.ensureNotDisposed();
    this._isDisposed = true;
    const meshes: THREE.Mesh[] = this.children.filter(x => x instanceof THREE.Mesh).map(x => x as THREE.Mesh);
    for (const mesh of meshes) {
      if (mesh.geometry !== undefined) {
        mesh.geometry.dispose();
        // // NOTE: Forcefully creating a new reference here to make sure
        // // there are no lingering references to the large geometry buffer
        mesh.geometry = emptyGeometry;
      }
    }
  }

  private ensureNotDisposed() {
    if (this._isDisposed) {
      throw new Error('Already disposed/dereferenced');
    }
  }
}
