/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { packFloat } from '@/utilities/packFloatToVec4';
import { determinePowerOfTwoDimensions } from '@/utilities/determinePowerOfTwoDimensions';

export class TransformOverrideBuffer {
  private readonly MIN_NUMBER_OF_TREE_INDECES = 16;
  private readonly NUMBER_OF_ELEMENTS_PER_MATRIX = 16;
  private readonly BYTES_PER_FLOAT = 4;

  private _dataTexture: THREE.DataTexture;
  private _textureBuffer: Uint8Array;

  private _unusedIndices: number[];

  private _onGenerateNewDataTextureCallback: (datatexture: THREE.DataTexture) => void;

  get dataTexture(): THREE.DataTexture {
    return this._dataTexture;
  }

  constructor(onGenerateNewDataTexture: (datatexture: THREE.DataTexture) => void) {
    this._textureBuffer = new Uint8Array(
      this.MIN_NUMBER_OF_TREE_INDECES * this.NUMBER_OF_ELEMENTS_PER_MATRIX * this.BYTES_PER_FLOAT
    );

    this._dataTexture = new THREE.DataTexture(
      this._textureBuffer,
      this.NUMBER_OF_ELEMENTS_PER_MATRIX,
      this.MIN_NUMBER_OF_TREE_INDECES
    );

    this._onGenerateNewDataTextureCallback = onGenerateNewDataTexture;

    this._unusedIndices = [...Array(this.MIN_NUMBER_OF_TREE_INDECES).keys()].map((_, n) => n);
  }

  public overrideTransform(transform: THREE.Matrix4): number {
    //TODO christjt - 09/09/2020: Can be made more efficient by
    //dropping transpose and just accessing correct indecies in the loop
    const transformBuffer = transform.transpose().toArray();

    let matrixIndex = this._unusedIndices.pop();

    if (matrixIndex === undefined) {
      this.reComputeDataTexture();
      matrixIndex = this._unusedIndices.pop()!;
    }

    for (let i = 0; i < this.NUMBER_OF_ELEMENTS_PER_MATRIX; i++) {
      const element = packFloat(transformBuffer[i]);

      const byteIndex = (matrixIndex * this.NUMBER_OF_ELEMENTS_PER_MATRIX + i) * this.BYTES_PER_FLOAT;

      this._dataTexture.image.data[byteIndex] = element.x;
      this._dataTexture.image.data[byteIndex + 1] = element.y;
      this._dataTexture.image.data[byteIndex + 2] = element.z;
      this._dataTexture.image.data[byteIndex + 3] = element.w;
    }

    return matrixIndex;
  }

  private reComputeDataTexture() {
    const currentTextureBufferLength = this._textureBuffer.length;

    const newTextureBuffer = new Uint8Array(currentTextureBufferLength * 2);

    newTextureBuffer.set(this._textureBuffer);

    const textureDims = determinePowerOfTwoDimensions((currentTextureBufferLength * 2) / this.BYTES_PER_FLOAT);

    const newDataTexture = new THREE.DataTexture(newTextureBuffer, textureDims.width, textureDims.height);

    const numberOfNewTreeIndices =
      currentTextureBufferLength / (this.BYTES_PER_FLOAT * this.NUMBER_OF_ELEMENTS_PER_MATRIX);

    this._unusedIndices.push(...[...Array(numberOfNewTreeIndices).keys()].map((_, n) => n + numberOfNewTreeIndices));

    this._textureBuffer = newTextureBuffer;
    this._dataTexture = newDataTexture;

    this._onGenerateNewDataTextureCallback(newDataTexture);
  }
}
