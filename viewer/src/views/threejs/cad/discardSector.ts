/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export function discardSector(group: THREE.Group) {
  const meshes: THREE.Mesh[] = group.children.filter(x => x instanceof THREE.Mesh).map(x => x as THREE.Mesh);
  for (const mesh of meshes) {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material && mesh.material instanceof THREE.Material) {
      mesh.material.dispose();
    }
    if (mesh.material && mesh.material instanceof Array) {
      for (const material of mesh.material) {
        material.dispose();
      }
    }
  }
}
