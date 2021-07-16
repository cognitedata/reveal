/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

/**
 * Util functions
 */

function writeMatrix4(dataView: DataView, byteOffset: number, matrix: THREE.Matrix4) {
  const elements = matrix.elements;

  for (let i = 0; i < 16; i++) {
    dataView.setFloat32(byteOffset + i * 4, elements[i], true);
  }
}

const boxInputStructSize = 52;
const boxOutputStructSize = 72;

export function getBoxOutputSize(inputBuffer: Uint8Array): number {
  return Math.round((inputBuffer.byteLength / boxInputStructSize) * boxOutputStructSize);
}

/**
 * Functions for transforming incoming primitive buffers into GPU-usable buffers
 * Returns number of bytes written + original offset = the offset for next write to the buffer
 */

export function transformBoxes(inputBuffer: Uint8Array, outArray: Uint8Array, originalOutputOffset: number): number {
  const inputStructSize = 52;
  const outputStructSize = 72;

  let currentInputOffset = 0;
  let currentOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, inputStructSize);
    const outView = new DataView(outArray.buffer, originalOutputOffset + currentOutputOffset, outputStructSize);

    const treeIndex = inView.getFloat32(0, true);
    const color0 = inView.getUint8(4);
    const color1 = inView.getUint8(5);
    const color2 = inView.getUint8(6);
    const color3 = inView.getUint8(7);
    // const diagonal = inView.getFloat32(8, true);
    const centerX = inView.getFloat32(12, true);
    const centerY = inView.getFloat32(16, true);
    const centerZ = inView.getFloat32(20, true);
    const normalX = inView.getFloat32(24, true);
    const normalY = inView.getFloat32(28, true);
    const normalZ = inView.getFloat32(32, true);
    const deltaX = inView.getFloat32(36, true);
    const deltaY = inView.getFloat32(40, true);
    const deltaZ = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);

    const translationMatrix = new THREE.Matrix4().makeTranslation(centerX, centerY, centerZ);
    const firstRotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), rotationAngle);
    const secondRotation = new THREE.Matrix4().makeRotationFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(normalX, normalY, normalZ)
      )
    );
    const scaleMatrix = new THREE.Matrix4().makeScale(deltaX, deltaY, deltaZ);

    const instanceMatrix = translationMatrix.multiply(firstRotation).multiply(secondRotation).multiply(scaleMatrix);

    outView.setFloat32(0, treeIndex, true);
    outView.setUint8(4, color2);
    outView.setUint8(5, color1);
    outView.setUint8(6, color0);
    outView.setUint8(7, color3);

    writeMatrix4(outView, 8, instanceMatrix);

    currentInputOffset += inputStructSize;
    currentOutputOffset += outputStructSize;
  }

  return currentOutputOffset;
}
