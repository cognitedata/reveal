/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene, SectorMetadata, SectorSceneImpl } from './types';
import { Box3 } from '../../utils/Box3';
import { vec3 } from 'gl-matrix';

export interface CadSectorMetadataV8 {
  readonly id: number;
  readonly parentId: number;
  readonly path: string;
  readonly depth: number;
  readonly boundingBox: {
    readonly min: {
      x: number;
      y: number;
      z: number;
    };
    readonly max: {
      x: number;
      y: number;
      z: number;
    };
  };
  readonly indexFile: {
    readonly fileName: string;
    readonly peripheralFiles: string[];
    readonly estimatedDrawCallCount: number;
    readonly downloadSize: number;
  };
  readonly facesFile: {
    readonly quadSize: number;
    readonly coverageFactors: {
      xy: number;
      yz: number;
      xz: number;
    };
    readonly fileName: string | null;
    readonly downloadSize: number;
  };
}

export interface CadMetadataV8 {
  readonly version: 8;
  readonly maxTreeIndex: number;
  readonly sectors: CadSectorMetadataV8[];

  // Available, but unused:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
  // readonly unit: string | null;
}

export function parseCadMetadataV8(metadata: CadMetadataV8): SectorScene {
  // Create list of sectors and a map of child -> parent
  const sectorsById = new Map<number, SectorMetadata>();
  const parentIds: number[] = [];
  metadata.sectors.forEach(s => {
    const sector = createSectorMetadata(s);
    sectorsById.set(s.id, sector);
    parentIds[s.id] = s.parentId;
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

  return new SectorSceneImpl(metadata.version, metadata.maxTreeIndex, rootSector, sectorsById);
}

function createSectorMetadata(metadata: CadSectorMetadataV8): SectorMetadata {
  return {
    id: metadata.id,
    path: metadata.path,
    depth: metadata.depth,
    bounds: new Box3([
      vec3.fromValues(metadata.boundingBox.min.x, metadata.boundingBox.min.y, metadata.boundingBox.min.z),
      vec3.fromValues(metadata.boundingBox.max.x, metadata.boundingBox.max.y, metadata.boundingBox.max.z)
    ]),

    // I3D
    indexFile: { ...metadata.indexFile },
    // F3D
    facesFile: { ...metadata.facesFile },

    // Populated later
    children: []
  };
}
