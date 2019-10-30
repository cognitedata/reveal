/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { Sector, SectorMetadata } from '../../sector/types';
import { SectorNode } from './SectorNode';
import { toThreeJsBox3 } from './utilities';

export function consumeSector(sectorId: number, sector: Sector, metadata: SectorMetadata, sectorNode: SectorNode) {
  if (sector.triangleMeshes.length === 0) {
    // No geometry
    return;
  }

  const bounds = toThreeJsBox3(metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds);
  boundsRenderer.name = `Bounding box ${sectorId}`;
  sectorNode.add(boundsRenderer);

  const meshGroup = new THREE.Group();
  meshGroup.name = `Triangle meshes for sector ${sectorId}`;

  // TODO 20191025 larsmoa: Hack to avoid lots of big meshes, but
  // color information is lost. Fix.
  const uniqueFiles = new Set<number>(sector.triangleMeshes.map(x => x.fileId));
  for (const fileId of uniqueFiles) {
    const mesh = sector.triangleMeshes.find(x => x.fileId === fileId)!;

    const geometry = new THREE.BufferGeometry();
    const vertices = new THREE.Float32BufferAttribute(mesh.vertices, 3);
    const colors = new THREE.Float32BufferAttribute(mesh.colors, 3);
    geometry.setIndex(indices);
    geometry.addAttribute('position', vertices);
    geometry.addAttribute('color', colors);

    if (mesh.normals !== undefined) {
      const normals = new THREE.Float32BufferAttribute(mesh.normals, 3);
      geometry.addAttribute('normal', normals);
    } else {
      geometry.computeVertexNormals();
    }
    const material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, flatShading: true });
    const obj = new THREE.Mesh(geometry, material);

    obj.name = `Triangle mesh ${mesh.fileId}`;
    meshGroup.add(obj);
  }
  sectorNode.add(meshGroup);
}
