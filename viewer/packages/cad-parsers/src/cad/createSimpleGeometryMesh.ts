/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';

import { disposeAttributeArrayOnUpload, incrementOrInsertIndex } from '@reveal/utilities';
import { filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix } from './filterPrimitivesV8';

import { Materials } from '@reveal/rendering';

const quadVertexData = new Float32Array([
  /* eslint-disable prettier/prettier */
  -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0,
  0.5, 0.5, 0.0,

  0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0,
  -0.5, -0.5, 0.0,
  /*  eslint-enable prettier/prettier  */
]);

const quadVertexBufferAttribute = new THREE.Float32BufferAttribute(quadVertexData.buffer, 3);
const baseBoundingBox = new THREE.Box3().setFromArray(quadVertexData);
const primitiveAttributes: Map<string, ParsePrimitiveAttribute> = new Map([
  ['color', { offset: 0, size: 4 * 3 }],
  ['treeIndex', { offset: 12, size: 4 }],
  ['normal', { offset: 16, size: 4 * 3 }],
  ['instanceMatrix', { offset: 7 * 4, size: 16 * 4 }]
]);

export function createSimpleGeometryMesh(
  attributeValues: Float32Array,
  materials: Materials,
  sectorBounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | undefined {
  const attributeByteValues = new Uint8Array(attributeValues.buffer);
  const filteredByteValues = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    attributeByteValues,
    primitiveAttributes,
    baseBoundingBox,
    geometryClipBox
  );
  if (filteredByteValues.byteLength === 0) {
    // No data, just skip
    return undefined;
  }

  const filteredAttributeValues = new Float32Array(filteredByteValues.buffer);
  const stride = 3 + 1 + 3 + 16;
  if (filteredByteValues.byteLength % stride !== 0) {
    throw new Error(`Expected buffer size to be multiple of ${stride}, but got ${filteredAttributeValues.byteLength}`);
  }

  const geometry = new THREE.InstancedBufferGeometry();

  const interleavedBuffer32 = new THREE.InstancedInterleavedBuffer(filteredAttributeValues, stride);
  const color = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 0, true);
  const treeIndex = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 1, 3, false);
  const normal = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 4, true);
  const matrix0 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 7, false);
  const matrix1 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 11, false);
  const matrix2 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 15, false);
  const matrix3 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 19, false);

  geometry.setAttribute('position', quadVertexBufferAttribute);
  geometry.setAttribute('color', color);
  geometry.setAttribute('treeIndex', treeIndex);
  geometry.setAttribute('normal', normal);
  geometry.setAttribute('matrix0', matrix0);
  geometry.setAttribute('matrix1', matrix1);
  geometry.setAttribute('matrix2', matrix2);
  geometry.setAttribute('matrix3', matrix3);

  const obj = new THREE.Mesh(geometry, materials.simple);
  obj.name = 'Low detail geometry';
  obj.onAfterRender = () => {
    disposeAttributeArrayOnUpload.bind(interleavedBuffer32)();
    obj.onAfterRender = () => {};
  };

  obj.onBeforeRender = () => {
    const inverseModelMatrix: THREE.Matrix4 = materials.simple.uniforms.inverseModelMatrix.value;
    inverseModelMatrix.copy(obj.matrixWorld).invert();
  };

  setTreeIndicesToUserData();

  obj.geometry.boundingSphere = new THREE.Sphere();
  sectorBounds.getBoundingSphere(obj.geometry.boundingSphere);
  return obj;

  function setTreeIndicesToUserData() {
    const treeIndexAttributeOffset = 3;

    const treeIndices = new Map<number, number>();

    for (let i = 0; i < attributeValues.length / stride; i++) {
      incrementOrInsertIndex(treeIndices, attributeValues[i * stride + treeIndexAttributeOffset]);
    }
    obj.userData.treeIndices = treeIndices;
  }
}
