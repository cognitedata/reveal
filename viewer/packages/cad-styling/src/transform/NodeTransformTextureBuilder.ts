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
  private readonly _transformOverrideIndexBufferView: Float32Array;

  constructor(treeIndexCount: number, transformProvider: NodeTransformProvider) {
    const { dataTexture, bufferView } = allocateTransformOverrideIndexTexture(treeIndexCount);
    this._transformOverrideIndexTexture = dataTexture;
    this._transformOverrideIndexBufferView = bufferView;
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
    this._transformOverrideIndexBufferView[treeIndex] = transformIndex + 1;
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

function allocateTransformOverrideIndexTexture(treeIndexCount: number): {
  dataTexture: THREE.DataTexture;
  bufferView: Float32Array;
} {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = width * height;

  const transformOverrideIndexBuffer = new Float32Array(textureElementCount);
  const transformOverrideIndexTexture = new THREE.DataTexture(
    transformOverrideIndexBuffer,
    width,
    height,
    THREE.RedFormat,
    THREE.FloatType
  );

  return { dataTexture: transformOverrideIndexTexture, bufferView: transformOverrideIndexBuffer };
}
