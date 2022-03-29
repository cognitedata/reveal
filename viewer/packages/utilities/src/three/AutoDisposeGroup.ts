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
    console.log(this._referenceCount, this.id);
  }

  dereference(): void {
    this.ensureNotDisposed();
    if (this._referenceCount === 0) {
      throw new Error('No references');
    }
    if (--this._referenceCount === 0) {
      this.dispose();
    }
    console.log(this._referenceCount, this.id);
  }

  private dispose(): void {
    this.ensureNotDisposed();
    this._isDisposed = true;
    const meshes: THREE.Mesh[] = this.children.filter(x => x instanceof THREE.Mesh).map(x => x as THREE.Mesh);
    for (let i = 0; i < this.children.length; i++) {
      const mesh = this.children[i];
      if (mesh instanceof THREE.Mesh && mesh.geometry !== undefined) {
        mesh.geometry.dispose();
        delete mesh.geometry;
        // // NOTE: Forcefully creating a new reference here to make sure
        // // there are no lingering references to the large geometry buffer
        //mesh.geometry = emptyGeometry;
      }
      if (mesh instanceof THREE.BufferGeometry) {
        mesh.dispose();
        delete this.children[i];
      }
    }
    this.clear();
  }

  private ensureNotDisposed() {
    if (this._isDisposed) {
      throw new Error('Already disposed/dereferenced');
    }
  }
}
