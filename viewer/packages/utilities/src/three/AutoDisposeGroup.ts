/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

const emptyGeometry = new THREE.BufferGeometry();

/**
 * Referenced count implementation of THREE.Group that
 * automatically disposes all geometries contained in meshes that
 * are direct children of the group, in addition to a provided set of textures
 */
export class AutoDisposeGroup extends THREE.Group {
  private _isDisposed = false;
  private _referenceCount = 0;

  private _textures: THREE.Texture[] = [];

  public addTexture(texture: THREE.Texture) {
    this._textures.push(texture);
  }

  isDisposed(): boolean {
    return this._isDisposed;
  }

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

    for (const child of this.children) {
      if (child instanceof THREE.Mesh && child.geometry !== undefined) {
        child.geometry.dispose();

        // // NOTE: Forcefully creating a new reference here to make sure
        // // there are no lingering references to the large geometry buffer
        child.geometry = emptyGeometry;
      }
      if (child instanceof THREE.BufferGeometry) {
        child.dispose();
      }
    }

    this._textures.forEach(texture => texture.dispose());

    this.clear();
  }

  private ensureNotDisposed() {
    if (this._isDisposed) {
      throw new Error('Already disposed/dereferenced');
    }
  }
}
