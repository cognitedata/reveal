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

  // TODO duplicate definition with the one in CadNode (which should perhaps not be there at all)
  const setColor = (treeIndex: number, red: number, green: number, blue: number) => {
    materials.colorDataTexture.image.data[4 * treeIndex] = red;
    materials.colorDataTexture.image.data[4 * treeIndex + 1] = green;
    materials.colorDataTexture.image.data[4 * treeIndex + 2] = blue;
    materials.colorDataTexture.image.data[4 * treeIndex + 3] = 255;
    materials.colorDataTexture.needsUpdate = true;
  };

  for (const primtiveRoot of createPrimitives(sector, materials, setColor)) {
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
