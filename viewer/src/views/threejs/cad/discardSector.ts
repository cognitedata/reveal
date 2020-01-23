/*!
 * Copyright 2019 Cognite AS
 */

import { SectorNode } from './SectorNode';
import * as THREE from 'three';

export function discardSector(sectorId: number, sectorNode: SectorNode) {
  const meshes: THREE.Mesh[] = sectorNode.children.filter(x => x instanceof THREE.Mesh).map(x => x as THREE.Mesh);
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
  const sectorChildren = sectorNode.children.filter(x => !(x instanceof SectorNode));
  sectorNode.remove(...sectorChildren);
}
