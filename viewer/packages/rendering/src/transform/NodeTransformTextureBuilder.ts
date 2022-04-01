/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { TransformOverrideBuffer } from './TransformOverrideBuffer';

import { determinePowerOfTwoDimensions, assertNever, NumericRange } from '@reveal/utilities';
import { NodeTransformProvider } from './NodeTransformProvider';

export class NodeTransformTextureBuilder {
  private readonly _transformProvider: NodeTransformProvider;
  private readonly _transformOverrideBuffer: TransformOverrideBuffer;
  private readonly _transformOverrideIndexTexture: THREE.DataTexture;
  private _needsUpdate = false;
  private readonly _handleTransformChangedBound = this.handleTransformChanged.bind(this);

  constructor(treeIndexCount: number, transformProvider: NodeTransformProvider) {
    this._transformOverrideIndexTexture = allocateTransformOverrideTexture(treeIndexCount);
    this._transformOverrideBuffer = new TransformOverrideBuffer(this.handleNewTransformTexture.bind(this));
    this._transformProvider = transformProvider;

    this._transformProvider.on('changed', this._handleTransformChangedBound);
  }

  dispose(): void {
    this._transformOverrideBuffer.dispose();
    this._transformOverrideIndexTexture.dispose();
    this._transformProvider.off('changed', this._handleTransformChangedBound);
  }

  get needsUpdate(): boolean {
    return this._needsUpdate;
  }

  get overrideTransformIndexTexture(): THREE.DataTexture {
    return this._transformOverrideIndexTexture;
  }

  get transformLookupTexture(): THREE.DataTexture {
    return this._transformOverrideBuffer.dataTexture;
  }

  build(): void {
    this._needsUpdate = false;
  }

  private setNodeTransform(treeIndices: NumericRange, transform: THREE.Matrix4) {
    const transformIndex = this._transformOverrideBuffer.addOverrideTransform(treeIndices.from, transform);
    treeIndices.forEach(treeIndex => this.setOverrideIndex(treeIndex, transformIndex));
    this._needsUpdate = true;
  }

  private resetNodeTransform(treeIndices: NumericRange) {
    this._transformOverrideBuffer.removeOverrideTransform(treeIndices.from);
    treeIndices.forEach(treeIndex => this.setOverrideIndex(treeIndex, -1));
    this._needsUpdate = true;
  }

  private setOverrideIndex(treeIndex: number, transformIndex: number) {
    const data = this._transformOverrideIndexTexture.image.data;
    data[treeIndex * 4 + 0] = (transformIndex + 1) >> 16;
    data[treeIndex * 4 + 1] = (transformIndex + 1) >> 8;
    data[treeIndex * 4 + 2] = (transformIndex + 1) >> 0;
    this._transformOverrideIndexTexture.needsUpdate = true;
  }

  private handleNewTransformTexture() {
    this._needsUpdate = true;
  }

  private handleTransformChanged(change: 'set' | 'reset', treeIndices: NumericRange, transform: THREE.Matrix4) {
    switch (change) {
      case 'set':
        this.setNodeTransform(treeIndices, transform);
        break;
      case 'reset':
        this.resetNodeTransform(treeIndices);
        break;
      default:
        assertNever(change, `Unexpected change type '${change}'`);
    }
  }
}

function allocateTransformOverrideTexture(treeIndexCount: number): THREE.DataTexture {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = width * height;

  // Texture for holding node transforms (translation, scale, rotation)
  const transformOverrideIndexBuffer = new Uint8ClampedArray(4 * textureElementCount);
  const transformOverrideIndexTexture = new THREE.DataTexture(
    transformOverrideIndexBuffer,
    width,
    height,
    THREE.RGBAFormat
  );

  return transformOverrideIndexTexture;
}
