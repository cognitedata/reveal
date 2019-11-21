/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { Sector, SectorMetadata, SectorQuads } from '../../../models/sector/types';
import { SectorNode } from './SectorNode';
import { toThreeJsBox3 } from '../utilities';
import { vertexShaderDetailed, fragmentShader } from './shaders';

export function consumeSectorDetailed(
  sectorId: number,
  sector: Sector,
  metadata: SectorMetadata,
  sectorNode: SectorNode
) {
  if (sector.triangleMeshes.length === 0) {
    // No geometry
    return;
  }

  const group = new THREE.Group();
  group.name = `Triangle meshes for sector ${sectorId}`;

  const bounds = toThreeJsBox3(metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds);
  boundsRenderer.name = `Bounding box ${sectorId}`;
  // group.add(boundsRenderer);

  // TODO 20191025 larsmoa: Hack to avoid lots of big meshes, but
  // color information is lost. Fix.
  const uniqueFiles = new Set<number>(sector.triangleMeshes.map(x => x.fileId));
  for (const fileId of uniqueFiles) {
    const mesh = sector.triangleMeshes.find(x => x.fileId === fileId)!;

    const geometry = new THREE.BufferGeometry();
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);
    const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1);
    const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3);
    const colors = new THREE.Float32BufferAttribute(mesh.colors.buffer, 3);
    geometry.setIndex(indices);
    geometry.addAttribute('position', vertices);
    geometry.addAttribute('color', colors);

    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);

    if (mesh.normals !== undefined) {
      const normals = new THREE.Float32BufferAttribute(mesh.normals.buffer, 3);
      geometry.addAttribute('normal', normals);
    } else {
      geometry.computeVertexNormals();
    }
    // const material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, flatShading: true });
    const material = new THREE.ShaderMaterial({
      uniforms: {},
      fragmentShader: fragmentShader(),
      vertexShader: vertexShaderDetailed()
    });
    const obj = new THREE.Mesh(geometry, material);

    obj.name = `Triangle mesh ${mesh.fileId}`;
    group.add(obj);
  }
  sectorNode.add(group);
}
