/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { V9SectorMetadata } from '../types';
import { SectorScene } from '../../utilities/types';
import { SectorSceneImpl } from '../../utilities/SectorScene';
import { CadSceneRootMetadata, V9SceneSectorMetadata } from './types';

export function parseCadMetadataGltf(metadata: CadSceneRootMetadata): SectorScene {
  // Create list of sectors and a map of child -> parent
  const sectorsById = new Map<number, V9SectorMetadata>();
  const parentIds: number[] = [];
  metadata.sectors.forEach(s => {
    const sector = createSectorMetadata(s as V9SceneSectorMetadata);
    sectorsById.set(s.id, sector);
    parentIds[s.id] = s.parentId ?? -1;
  });

  // Establish relationships between sectors
  for (const sector of sectorsById.values()) {
    const parentId = parentIds[sector.id];
    if (parentId === -1) {
      continue;
    }
    const parent = sectorsById.get(parentId)!;
    parent.children.push(sector);
  }

  const rootSector = sectorsById.get(0);
  if (!rootSector) {
    throw new Error('Root sector not found, must have ID 0');
  }

  const unit = metadata.unit !== null ? metadata.unit : 'Meters';

  return new SectorSceneImpl(metadata.version, metadata.maxTreeIndex, unit, rootSector, sectorsById);
}

function createSectorMetadata(metadata: V9SceneSectorMetadata): V9SectorMetadata {
  const bb = metadata.boundingBox;
  const min_x = bb.min.x;
  const min_y = bb.min.y;
  const min_z = bb.min.z;
  const max_x = bb.max.x;
  const max_y = bb.max.y;
  const max_z = bb.max.z;
  return {
    id: metadata.id,
    path: metadata.path,
    depth: metadata.depth,
    bounds: new THREE.Box3(new THREE.Vector3(min_x, min_y, min_z), new THREE.Vector3(max_x, max_y, max_z)),
    estimatedDrawCallCount: metadata.estimatedDrawCallCount,
    estimatedRenderCost: metadata.estimatedTriangleCount || 0,
    downloadSize: metadata.downloadSize || 0,
    maxDiagonalLength: metadata.maxDiagonalLength || 0,
    minDiagonalLength: metadata.minDiagonalLength || 0,
    sectorFileName: metadata.sectorFileName,

    // Populated later
    children: []
  };
}
