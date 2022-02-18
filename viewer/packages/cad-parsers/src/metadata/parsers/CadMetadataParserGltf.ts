/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata, V9SectorMetadata } from '../types';
import { SectorScene } from '../../utilities/types';
import { SectorSceneImpl } from '../../utilities/SectorScene';
import { BoundingBox, CadSceneRootMetadata, V9SceneSectorMetadata } from './types';

export function parseCadMetadataGltf(metadata: CadSceneRootMetadata): SectorScene {
  if (!metadata.sectors || metadata.sectors.length === 0) {
    throw new Error('No sectors found in scene JSON file');
  }

  // In earlier v9-models, the geometryBoundingBox did not exist and boundingBox
  // did not contain all geometry of the sector's children and must thus be computed here
  const mustComputeFullBoundingBox = metadata.sectors[0].geometryBoundingBox === undefined;

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

  if (mustComputeFullBoundingBox) {
    for (const sector of sectorsById.values()) {
      computeSubtreeBoundingBoxRecursive(sector);
    }
  }

  const rootSector = sectorsById.get(0);
  if (!rootSector) {
    throw new Error('Root sector not found, must have ID 0');
  }

  const unit = metadata.unit !== null ? metadata.unit : 'Meters';

  return new SectorSceneImpl(metadata.version, metadata.maxTreeIndex, unit, rootSector, sectorsById);
}

function toThreeBoundingBox(box: BoundingBox): THREE.Box3 {
  return new THREE.Box3(
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z)
  );
}

function createSectorMetadata(metadata: V9SceneSectorMetadata): V9SectorMetadata {
  const metadataBoundingBox = toThreeBoundingBox(metadata.boundingBox);

  let geometryBoundingBox: THREE.Box3;
  let subtreeBoundingBox: THREE.Box3;

  // In earlier v9 models, geometryBoundingBox does not exist, and boundingBox
  // only encapsulates geometry in the current sector. These cases must be treated differently
  if (metadata.geometryBoundingBox) {
    geometryBoundingBox = toThreeBoundingBox(metadata.geometryBoundingBox);
    subtreeBoundingBox = metadataBoundingBox;
  } else {
    geometryBoundingBox = metadataBoundingBox;

    // Compute this from children's bounding boxes later on
    subtreeBoundingBox = new THREE.Box3();
  }

  return {
    id: metadata.id,
    path: metadata.path,
    depth: metadata.depth,
    subtreeBoundingBox,
    geometryBoundingBox,
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

function computeSubtreeBoundingBoxRecursive(sector: SectorMetadata): void {
  if (!sector.subtreeBoundingBox.isEmpty()) {
    return;
  }

  if (sector.children.length === 0) {
    sector.subtreeBoundingBox.copy((sector as V9SectorMetadata).geometryBoundingBox);
    return;
  }

  for (const child of sector.children) {
    computeSubtreeBoundingBoxRecursive(child);

    sector.subtreeBoundingBox.expandByPoint(child.subtreeBoundingBox.max);
    sector.subtreeBoundingBox.expandByPoint(child.subtreeBoundingBox.min);
  }
}
