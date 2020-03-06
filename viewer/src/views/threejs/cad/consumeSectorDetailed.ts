/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Sector, SectorMetadata } from '../../../models/cad/types';
import { SectorNode } from './SectorNode';
import { toThreeJsBox3 } from '../utilities';
import { createPrimitives } from './primitives';
import { createTriangleMeshes } from './triangleMeshes';
import { createInstancedMeshes } from './instancedMeshes';
import { Materials } from './materials';

export function consumeSectorDetailed(
  sectorId: number,
  sector: Sector,
  metadata: SectorMetadata,
  materials: Materials
) {
  const bounds = toThreeJsBox3(new THREE.Box3(), metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds);
  boundsRenderer.name = `Bounding box ${sectorId}`;
  const obj = new THREE.Group();
  // group.add(boundsRenderer);

  for (const primtiveRoot of createPrimitives(sector, materials)) {
    obj.add(primtiveRoot);
  }
  const triangleMeshes = createTriangleMeshes(sector.triangleMeshes, bounds, materials.triangleMesh);
  for (const triangleMesh of triangleMeshes) {
    obj.add(triangleMesh);
  }
  const instanceMeshes = createInstancedMeshes(sector.instanceMeshes, bounds, materials.instancedMesh);
  for (const instanceMesh of instanceMeshes) {
    obj.add(instanceMesh);
  }
  return obj;
}
