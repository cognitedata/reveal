/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { Sector, SectorMetadata } from '../../../models/sector/types';
import { SectorNode } from './SectorNode';
import { toThreeJsBox3 } from '../utilities';
import { createPrimitives } from './primitives';
import { createTriangleMeshes } from './triangleMeshes';
import { createInstancedMeshes } from './instancedMeshes';

export function consumeSectorDetailed(
  sectorId: number,
  sector: Sector,
  metadata: SectorMetadata,
  sectorNode: SectorNode
) {
  const group = new THREE.Group();
  group.name = `Triangle meshes for sector ${sectorId}`;

  const bounds = toThreeJsBox3(metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds);
  boundsRenderer.name = `Bounding box ${sectorId}`;

  group.add(boundsRenderer);
  for (const primtiveRoot of createPrimitives(sector)) {
    group.add(primtiveRoot);
  }
  const triangleMeshes = createTriangleMeshes(sector.triangleMeshes, bounds);
  for (const triangleMesh of triangleMeshes) {
    group.add(triangleMesh);
  }
  const instanceMeshes = createInstancedMeshes(sector.instanceMeshes, bounds);
  for (const instanceMesh of instanceMeshes) {
    group.add(instanceMesh);
  }

  sectorNode.add(group);
}
