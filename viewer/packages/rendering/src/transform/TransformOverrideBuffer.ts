/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { packFloatInto } from '@reveal/utilities';
import { determinePowerOfTwoDimensions } from '@reveal/utilities';

export class TransformOverrideBuffer {
  private static readonly MIN_NUMBER_OF_TREE_INDICES = 16;
  private static readonly NUMBER_OF_ELEMENTS_PER_MATRIX = 16;
  private static readonly BYTES_PER_FLOAT = 4;

  private _dataTexture: THREE.DataTexture;
  private _textureBuffer: Uint8Array;

  private readonly _unusedIndices: number[];

  private readonly _treeIndexToOverrideIndex: Map<number, number>;

  private readonly _onGenerateNewDataTextureCallback: (datatexture: THREE.DataTexture) => void;

  get dataTexture(): THREE.DataTexture {
    return this._dataTexture;
  }

  get overrideIndices(): Map<number, number> {
    return this._treeIndexToOverrideIndex;
  }

  constructor(onGenerateNewDataTexture: (datatexture: THREE.DataTexture) => void) {
    this._textureBuffer = new Uint8Array(
      TransformOverrideBuffer.MIN_NUMBER_OF_TREE_INDICES *
        TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX *
        TransformOverrideBuffer.BYTES_PER_FLOAT
    );

    this._dataTexture = new THREE.DataTexture(
      this._textureBuffer,
      TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX,
      TransformOverrideBuffer.MIN_NUMBER_OF_TREE_INDICES
    );

    this._onGenerateNewDataTextureCallback = onGenerateNewDataTexture;

    this._unusedIndices = [...Array(TransformOverrideBuffer.MIN_NUMBER_OF_TREE_INDICES).keys()].map((_, n) => n);

    this._treeIndexToOverrideIndex = new Map();
  }

  dispose(): void {
    this._dataTexture.dispose();
    // @ts-ignore
    delete this._dataTexture.image;
  }

  public addOverrideTransform(treeIndex: number, transform: THREE.Matrix4): number {
    const transformBuffer = transform.toArray();

    let matrixIndex: number | undefined;

    if (this._treeIndexToOverrideIndex.has(treeIndex)) {
      matrixIndex = this._treeIndexToOverrideIndex.get(treeIndex)!;
    } else {
      matrixIndex = this._unusedIndices.pop();

      if (matrixIndex === undefined) {
        this.recomputeDataTexture();
        matrixIndex = this._unusedIndices.pop()!;
      }

      this._treeIndexToOverrideIndex.set(treeIndex, matrixIndex);
    }

    for (let i = 0; i < TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX; i++) {
      const byteIndex =
        (matrixIndex * TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX + i) *
        TransformOverrideBuffer.BYTES_PER_FLOAT;

      const matrixElement = transformBuffer[(i % 4) * 4 + Math.floor(i / 4)];

      packFloatInto(matrixElement, this._dataTexture.image.data, byteIndex);
    }

    this._dataTexture.needsUpdate = true;

    return matrixIndex;
  }

  public removeOverrideTransform(treeIndex: number): void {
    if (!this._treeIndexToOverrideIndex.has(treeIndex)) return;

    const matrixIndex = this._treeIndexToOverrideIndex.get(treeIndex)!;

    this._unusedIndices.push(matrixIndex);
    this._treeIndexToOverrideIndex.delete(treeIndex);
  }

  private recomputeDataTexture() {
    const currentTextureBufferLength = this._textureBuffer.length;

    const newTextureBuffer = new Uint8Array(currentTextureBufferLength * 2);

    newTextureBuffer.set(this._textureBuffer);

    const textureDims = determinePowerOfTwoDimensions(
      (currentTextureBufferLength * 2) / TransformOverrideBuffer.BYTES_PER_FLOAT
    );

    const newDataTexture = new THREE.DataTexture(newTextureBuffer, textureDims.width, textureDims.height);

    const numberOfNewTreeIndices =
      currentTextureBufferLength /
      (TransformOverrideBuffer.BYTES_PER_FLOAT * TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX);

    for (let i = numberOfNewTreeIndices; i < numberOfNewTreeIndices * 2; i++) {
      this._unusedIndices.push(i);
    }

    this._textureBuffer = newTextureBuffer;
    this._dataTexture = newDataTexture;

    this._onGenerateNewDataTextureCallback(newDataTexture);
  }
}
