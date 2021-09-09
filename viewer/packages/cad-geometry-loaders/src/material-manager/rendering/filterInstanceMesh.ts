/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { float32BufferToMatrix } from '../../utilities/float32BufferToMatrix';
import { InstancedMesh } from './types';

const filterInstanceMeshVars = {
  p: new THREE.Vector3(),
  instanceMatrix: new THREE.Matrix4(),
  baseBounds: new THREE.Box3(),
  instanceBounds: new THREE.Box3()
};

export function filterInstanceMesh(
  vertices: Float32Array,
  indices: Uint32Array,
  instanceMesh: InstancedMesh,
  geometryClipBox: THREE.Box3 | null
): InstancedMesh {
  if (geometryClipBox === null) {
    return instanceMesh;
  }
  const { p, instanceMatrix, baseBounds, instanceBounds } = filterInstanceMeshVars;

  // Determine base bounds
  baseBounds.makeEmpty();
  for (let j = instanceMesh.triangleOffset; j < instanceMesh.triangleOffset + instanceMesh.triangleCount; ++j) {
    const v0 = indices[3 * j + 0];
    const v1 = indices[3 * j + 1];
    const v2 = indices[3 * j + 2];
    p.set(vertices[v0 + 0], vertices[v0 + 1], vertices[v0 + 2]);
    baseBounds.expandByPoint(p);
    p.set(vertices[v1 + 0], vertices[v1 + 1], vertices[v1 + 2]);
    baseBounds.expandByPoint(p);
    p.set(vertices[v2 + 0], vertices[v2 + 1], vertices[v2 + 2]);
    baseBounds.expandByPoint(p);
  }

  let filteredOffset = 0;
  const instanceCount = instanceMesh.treeIndices.length;
  const filteredInstanceMatrices = new Float32Array(instanceMesh.instanceMatrices.length);
  const filteredTreeIndices = new Float32Array(instanceCount);
  const filteredColors = new Uint8Array(4 * instanceCount);
  for (let i = 0; i < instanceCount; ++i) {
    float32BufferToMatrix(instanceMesh.instanceMatrices, i, instanceMatrix);

    instanceBounds.copy(baseBounds).applyMatrix4(instanceMatrix);
    if (geometryClipBox.intersectsBox(instanceBounds)) {
      const elementInstanceMatrix = instanceMesh.instanceMatrices.subarray(16 * i, 16 * (i + 1));
      const elementColor = instanceMesh.colors.subarray(4 * i, 4 * (i + 1));
      const elementTreeIndex = instanceMesh.treeIndices[i];

      filteredInstanceMatrices.set(elementInstanceMatrix, 16 * filteredOffset);
      filteredColors.set(elementColor, 4 * filteredOffset);
      filteredTreeIndices[filteredOffset] = elementTreeIndex;

      filteredOffset++;
    }
  }

  if (instanceCount === filteredOffset) {
    return instanceMesh; // Unchanged
  }

  const filteredMesh: InstancedMesh = {
    triangleCount: instanceMesh.triangleCount,
    triangleOffset: instanceMesh.triangleOffset,
    instanceMatrices: filteredInstanceMatrices.slice(0, 16 * filteredOffset),
    colors: filteredColors.slice(0, 4 * filteredOffset),
    treeIndices: filteredTreeIndices.slice(0, filteredOffset)
  };
  return filteredMesh;
}
