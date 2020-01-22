/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { InstancedMeshFile } from '../../../models/cad/types';
import { sectorShaders, shaderDefines } from './shaders';

const instancedMeshMaterial = new THREE.ShaderMaterial({
  name: 'Instanced meshes',
  ...shaderDefines,
  extensions: {
    derivatives: true
  },
  side: THREE.DoubleSide,
  fragmentShader: sectorShaders.instancedMesh.fragment,
  vertexShader: sectorShaders.instancedMesh.vertex
});

export function createInstancedMeshes(meshes: InstancedMeshFile[], bounds: THREE.Box3): THREE.Mesh[] {
  const result: THREE.Mesh[] = [];

  for (const meshFile of meshes) {
    const indices = new THREE.Uint32BufferAttribute(meshFile.indices.buffer, 1);
    const vertices = new THREE.Float32BufferAttribute(meshFile.vertices.buffer, 3);
    for (const instancedMesh of meshFile.instances) {
      const triangleCount = instancedMesh.triangleCount;
      const triangleOffset = instancedMesh.triangleOffset;
      const geometry = new THREE.InstancedBufferGeometry();
      geometry.setDrawRange(triangleOffset * 3, triangleCount * 3);
      geometry.boundingBox = bounds.clone(); // TODO 2019-12-03 larsmoa: Share instance with all geometries?
      geometry.boundingSphere = new THREE.Sphere();
      bounds.getBoundingSphere(geometry.boundingSphere);
      geometry.setIndex(indices);
      geometry.setAttribute('position', vertices);
      geometry.setAttribute('a_treeIndex', new THREE.InstancedBufferAttribute(instancedMesh.treeIndices, 1));
      geometry.setAttribute(`a_color`, new THREE.InstancedBufferAttribute(instancedMesh.colors, 4, true));
      // TODO de-duplicate this, which is the same as in setAttributes
      const buffer = new THREE.InstancedInterleavedBuffer(instancedMesh.instanceMatrices, 16);
      for (let column = 0; column < 4; column++) {
        const attribute = new THREE.InterleavedBufferAttribute(buffer, 4, column * 4);
        geometry.setAttribute(`a_instanceMatrix_column_${column}`, attribute);
      }
      geometry.boundingBox = bounds.clone();
      geometry.boundingSphere = new THREE.Sphere();
      bounds.getBoundingSphere(geometry.boundingSphere);
      const obj = new THREE.Mesh(geometry, instancedMeshMaterial);
      obj.name = `Instanced mesh ${meshFile.fileId}`;
      result.push(obj);
    }
  }
  return result;
}
