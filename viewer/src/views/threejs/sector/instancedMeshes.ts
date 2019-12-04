/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { InstancedMesh } from '../../../models/sector/types';
import { sectorShaders } from './shaders';

const instancedMeshMaterial = new THREE.ShaderMaterial({
  uniforms: {},
  fragmentShader: sectorShaders.instancedMesh.fragment,
  vertexShader: sectorShaders.instancedMesh.vertex
});

export function createInstancedMeshes(meshes: InstancedMesh[], bounds: THREE.Box3): THREE.Mesh[] {
  const result: THREE.Mesh[] = [];
  const uniqueFiles = new Set<number>(meshes.map(x => x.fileId));
  for (const fileId of uniqueFiles) {
    const mesh = meshes.find(x => x.fileId === fileId)!;
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.boundingBox = bounds.clone(); // TODO 2019-12-03 larsmoa: Share instance with all geometries?
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);
    const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1);
    const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3);
    geometry.setIndex(indices);
    geometry.setAttribute('position', vertices);
    geometry.setAttribute(`a_color`, new THREE.InstancedBufferAttribute(mesh.colors, 4, true));
    // TODO de-duplicate this, which is the same as in setAttributes
    const buffer = new THREE.InstancedInterleavedBuffer(mesh.instanceMatrices, 16);
    for (let column = 0; column < 4; column++) {
      const attribute = new THREE.InterleavedBufferAttribute(buffer, 4, column * 4);
      geometry.setAttribute(`a_instanceMatrix_column_${column}`, attribute);
    }
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);
    if (mesh.normals !== undefined) {
      const normals = new THREE.Float32BufferAttribute(mesh.normals.buffer, 3);
      geometry.setAttribute('normal', normals);
    } else {
      geometry.computeVertexNormals();
    }
    const obj = new THREE.Mesh(geometry, instancedMeshMaterial);
    obj.name = `Instanced mesh ${mesh.fileId}`;
    result.push(obj);
  }
  return result;
}
