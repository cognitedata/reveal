/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata, SectorMetadataFacesFileSection, SectorScene } from '../sector/types';
import { SectorSceneImpl } from '../sector/SectorScene';
import { Box3 } from '@/utilities/Box3';
import { vec3 } from 'gl-matrix';
import { traverseUpwards } from '@/utilities/objectTraversal';

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
    readonly recursiveCoverageFactors:
      | {
          xy: number;
          yz: number;
          xz: number;
        }
      | undefined;
    readonly fileName: string | null;
    readonly downloadSize: number;
  } | null;
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
    sector.parent = parent;
  }

  // Check for missing facesFile-sections and provide coverage factors from parents when necessary
  for (const sector of sectorsById.values()) {
    if (hasDummyFacesFileSection(sector)) {
      populateCoverageFactorsFromAnchestors(sector);
    }
  }

  const rootSector = sectorsById.get(0);
  if (!rootSector) {
    throw new Error('Root sector not found, must have ID 0');
  }

  return new SectorSceneImpl(metadata.version, metadata.maxTreeIndex, rootSector, sectorsById);
}

function createSectorMetadata(metadata: CadSectorMetadataV8): SectorMetadata {
  const facesFile = determineFacesFile(metadata);
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
    facesFile,

    // Populated later
    children: [],
    parent: undefined
  };
}

function determineFacesFile(metadata: CadSectorMetadataV8): SectorMetadataFacesFileSection {
  if (!metadata.facesFile) {
    return {
      quadSize: -1.0,
      coverageFactors: {
        xy: -1.0,
        yz: -1.0,
        xz: -1.0
      },
      recursiveCoverageFactors: {
        xy: -1.0,
        yz: -1.0,
        xz: -1.0
      },
      fileName: null,
      downloadSize: metadata.indexFile.downloadSize
    };
  }
  const facesFile = {
    ...metadata.facesFile,
    recursiveCoverageFactors: metadata.facesFile.recursiveCoverageFactors || metadata.facesFile.coverageFactors
  };
  return facesFile;
}

const dummyFacesFileSection: SectorMetadataFacesFileSection = {
  quadSize: -1.0,
  coverageFactors: {
    xy: 0.5,
    yz: 0.5,
    xz: 0.5
  },
  recursiveCoverageFactors: {
    xy: 0.5,
    yz: 0.5,
    xz: 0.5
  },
  fileName: null,
  downloadSize: 0
};

function hasDummyFacesFileSection(metadata: SectorMetadata): boolean {
  return metadata.facesFile.coverageFactors.xy === -1.0;
}

function populateCoverageFactorsFromAnchestors(sector: SectorMetadata) {
  // Find first parent with valud facesFile
  let firstValidFacesFile: SectorMetadataFacesFileSection | undefined;
  traverseUpwards(sector, parent => {
    firstValidFacesFile = hasDummyFacesFileSection(parent) ? undefined : parent.facesFile;
    return firstValidFacesFile === undefined;
  });
  if (!firstValidFacesFile) {
    // When there are no valid facesFile in the tree
    firstValidFacesFile = { ...dummyFacesFileSection };
  }

  sector.facesFile.coverageFactors.xy = firstValidFacesFile.recursiveCoverageFactors.xy;
  sector.facesFile.coverageFactors.yz = firstValidFacesFile.recursiveCoverageFactors.yz;
  sector.facesFile.coverageFactors.xz = firstValidFacesFile.recursiveCoverageFactors.xz;
  sector.facesFile.recursiveCoverageFactors.xy = firstValidFacesFile.recursiveCoverageFactors.xy;
  sector.facesFile.recursiveCoverageFactors.yz = firstValidFacesFile.recursiveCoverageFactors.yz;
  sector.facesFile.recursiveCoverageFactors.xz = firstValidFacesFile.recursiveCoverageFactors.xz;
}
