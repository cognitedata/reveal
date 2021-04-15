/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { disposeAttributeArrayOnUpload } from '../../../utilities/disposeAttributeArrayOnUpload';
import { Materials } from './materials';

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

export function createSimpleGeometryMesh(
  attributeValues: Float32Array,
  materials: Materials,
  sectorBounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Group {
  const group = new THREE.Group();
  const stride = 3 + 1 + 3 + 16;
  if (attributeValues.byteLength === 0) {
    // No data, just skip
    return new THREE.Group();
  }
  if (attributeValues.byteLength % stride !== 0) {
    throw new Error(`Expected buffer size to be multiple of ${stride}, but got ${attributeValues.byteLength}`);
  }

  const geometry = new THREE.InstancedBufferGeometry();

  const interleavedBuffer32 = new THREE.InstancedInterleavedBuffer(attributeValues, stride);
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

  group.add(obj);

  return group;

  function setTreeIndicesToUserData() {
    const treeIndexAttributeOffset = 3;

    const treeIndices = new Set();

    for (let i = 0; i < attributeValues.length / stride; i++) {
      treeIndices.add(attributeValues[i * stride + treeIndexAttributeOffset]);
    }
    obj.userData.treeIndices = treeIndices;
  }
}
