/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { disposeAttributeArrayOnUpload, incrementOrInsertIndex } from '@reveal/utilities';
import { TriangleMesh } from './types';

export function createTriangleMeshes(
  triangleMeshes: TriangleMesh[],
  bounds: THREE.Box3,
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh[] {
  const result: THREE.Mesh[] = [];

  const filteredTriangleMeshes = triangleMeshes.filter(mesh => {
    return geometryClipBox === null || isTriangleMeshWithin(mesh, geometryClipBox);
  });
  for (const mesh of filteredTriangleMeshes) {
    const geometry = new THREE.BufferGeometry();
    const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1).onUpload(disposeAttributeArrayOnUpload);
    const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3).onUpload(disposeAttributeArrayOnUpload);
    const colors = new THREE.Uint8BufferAttribute(mesh.colors.buffer, 3).onUpload(disposeAttributeArrayOnUpload);

    const treeIndices = new THREE.Float32BufferAttribute(mesh.treeIndices.buffer, 1).onUpload(
      disposeAttributeArrayOnUpload
    );
    geometry.setIndex(indices);
    geometry.setAttribute('color', colors);
    geometry.setAttribute('position', vertices);
    geometry.setAttribute('treeIndex', treeIndices);
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);

    const obj = new THREE.Mesh(geometry, material);
    obj.name = `Triangle mesh ${mesh.fileId}`;

    obj.userData.treeIndices = new Map<number, number>();

    for (const i of mesh.treeIndices) {
      incrementOrInsertIndex(obj.userData.treeIndices, i);
    }

    result.push(obj);
  }
  return result;
}

const isTriangleMeshWithinArgs = {
  p: new THREE.Vector3(),
  box: new THREE.Box3()
};

function isTriangleMeshWithin(mesh: TriangleMesh, bounds: THREE.Box3): boolean {
  const { p, box } = isTriangleMeshWithinArgs;
  box.makeEmpty();
  for (let i = 0; i < mesh.vertices.length; i += 3) {
    p.set(mesh.vertices[i + 0], mesh.vertices[i + 1], mesh.vertices[i + 2]);
    box.expandByPoint(p);
  }
  return bounds.intersectsBox(box);
}
