/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Sector, SectorMetadata } from './types';
import { toThreeJsBox3 } from '../../../../utilities/utilities';
import { createPrimitives } from '../rendering/primitives';
import { createTriangleMeshes } from '../rendering/triangleMeshes';
import { createInstancedMeshes } from '../rendering/instancedMeshes';
import { Materials } from '../rendering/materials';

export function consumeSectorDetailed(sector: Sector, metadata: SectorMetadata, materials: Materials) {
  const bounds = toThreeJsBox3(new THREE.Box3(), metadata.bounds);
  const obj = new THREE.Group();
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
