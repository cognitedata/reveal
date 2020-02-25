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
  sectorNode: SectorNode,
  materials: Materials
) {
  const bounds = toThreeJsBox3(new THREE.Box3(), metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds);
  boundsRenderer.name = `Bounding box ${sectorId}`;
  // group.add(boundsRenderer);

  for (const primtiveRoot of createPrimitives(sector, materials)) {
    sectorNode.add(primtiveRoot);
  }
  const triangleMeshes = createTriangleMeshes(sector.triangleMeshes, bounds, materials.triangleMesh);
  for (const triangleMesh of triangleMeshes) {
    sectorNode.add(triangleMesh);
  }
  const instanceMeshes = createInstancedMeshes(sector.instanceMeshes, bounds, materials.instancedMesh);
  for (const instanceMesh of instanceMeshes) {
    sectorNode.add(instanceMesh);
  }
}
