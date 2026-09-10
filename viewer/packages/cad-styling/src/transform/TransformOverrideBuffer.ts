/*!
 * Copyright 2021 Cognite AS
 */

import type { Matrix4 } from 'three';
import { DataTexture, FloatType, RedFormat } from 'three';

export class TransformOverrideBuffer {
  private static readonly MIN_NUMBER_OF_TREE_INDICES = 16;
  private static readonly NUMBER_OF_ELEMENTS_PER_MATRIX = 16;
  private static readonly NUMBER_OF_ROWS_PER_MATRIX = 4;

  private _dataTexture: DataTexture;
  private _textureBuffer: Float32Array;

  private readonly _unusedIndices: number[];

  private readonly _treeIndexToOverrideIndex: Map<number, number>;

  private readonly _onGenerateNewDataTextureCallback: (datatexture: DataTexture) => void;

  get dataTexture(): DataTexture {
    return this._dataTexture;
  }

  get overrideIndices(): Map<number, number> {
    return this._treeIndexToOverrideIndex;
  }

  constructor(onGenerateNewDataTexture: (datatexture: DataTexture) => void) {
    this._textureBuffer = new Float32Array(
      TransformOverrideBuffer.MIN_NUMBER_OF_TREE_INDICES * TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX
    );

    this._dataTexture = new DataTexture(this._textureBuffer, this._textureBuffer.length, 1, RedFormat, FloatType);

    this._onGenerateNewDataTextureCallback = onGenerateNewDataTexture;

    this._unusedIndices = [...Array(TransformOverrideBuffer.MIN_NUMBER_OF_TREE_INDICES).keys()].map((_, n) => n);

    this._treeIndexToOverrideIndex = new Map();
  }

  dispose(): void {
    this._dataTexture.dispose();
    // @ts-ignore
    delete this._dataTexture.image;
  }

  public addOverrideTransform(treeIndex: number, transform: Matrix4): number {
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
      const byteIndex = matrixIndex * TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX + i;
      const rowMajorMatrixIndex =
        (i % TransformOverrideBuffer.NUMBER_OF_ROWS_PER_MATRIX) * TransformOverrideBuffer.NUMBER_OF_ROWS_PER_MATRIX +
        Math.floor(i / TransformOverrideBuffer.NUMBER_OF_ROWS_PER_MATRIX);
      this._textureBuffer[byteIndex] = transformBuffer[rowMajorMatrixIndex];
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

    const newTextureBuffer = new Float32Array(currentTextureBufferLength * 2);

    newTextureBuffer.set(this._textureBuffer);

    const newDataTexture = new DataTexture(newTextureBuffer, newTextureBuffer.length, 1, RedFormat, FloatType);

    const currentLastMatrixIndex = currentTextureBufferLength / TransformOverrideBuffer.NUMBER_OF_ELEMENTS_PER_MATRIX;

    for (let i = currentLastMatrixIndex; i < currentLastMatrixIndex * 2; i++) {
      this._unusedIndices.push(i);
    }

    this._textureBuffer = newTextureBuffer;
    this._dataTexture = newDataTexture;

    this._onGenerateNewDataTextureCallback(newDataTexture);
  }
}
