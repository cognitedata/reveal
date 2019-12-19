/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { TriangleMesh } from '../../../models/sector/types';
import { sectorShaders } from './shaders';

export function createTriangleMeshes(triangleMeshes: TriangleMesh[], bounds: THREE.Box3): THREE.Mesh[] {
  // TODO since we iterate over unique files here as well as in parseSector,
  // we should just send the data grouped by file from the parsing
  // (and ideally from Rust)
  // TODO 20191025 larsmoa: Hack to avoid lots of big meshes, but
  // color information is lost. Fix.
  const result: THREE.Mesh[] = [];
  const uniqueFiles = new Set<number>(triangleMeshes.map(x => x.fileId));
  for (const fileId of uniqueFiles) {
    const mesh = triangleMeshes.find(x => x.fileId === fileId)!;
    const geometry = new THREE.BufferGeometry();
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);
    const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1);
    const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3);
    const colors = new THREE.Float32BufferAttribute(mesh.colors.buffer, 3);
    geometry.setIndex(indices);
    geometry.setAttribute('position', vertices);
    geometry.setAttribute('color', colors);
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);

    const material = new THREE.ShaderMaterial({
      uniforms: {},
      extensions: {
        derivatives: true
      },
      fragmentShader: sectorShaders.detailedMesh.fragment,
      vertexShader: sectorShaders.detailedMesh.vertex
    });
    const obj = new THREE.Mesh(geometry, material);
    obj.name = `Triangle mesh ${mesh.fileId}`;
    result.push(obj);
  }
  return result;
}
