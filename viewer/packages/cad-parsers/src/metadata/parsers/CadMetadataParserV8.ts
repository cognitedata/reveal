/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadataFacesFileSection, V8SectorMetadata } from '../types';
import { SectorScene } from '../../utilities/types';
import { SectorSceneImpl } from '../../utilities/SectorScene';
import { CadSceneRootMetadata, V8SceneSectorMetadata } from './types';

export function parseCadMetadataV8(metadata: CadSceneRootMetadata): SectorScene {
  // Create list of sectors and a map of child -> parent
  const sectorsById = new Map<number, V8SectorMetadata>();
  const parentIds: number[] = [];
  metadata.sectors.forEach(s => {
    const sector = createSectorMetadata(s as V8SceneSectorMetadata);
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
  // Check for missing facesFile-sections and provide coverage factors from parents when necessary
  populateCoverageFactorsFromAnchestors(rootSector, rootSector.facesFile);

  const unit = metadata.unit !== null ? metadata.unit : 'Meters';

  return new SectorSceneImpl(metadata.version, metadata.maxTreeIndex, unit, rootSector, sectorsById);
}

function createSectorMetadata(metadata: V8SceneSectorMetadata): V8SectorMetadata {
  const facesFile = determineFacesFile(metadata);

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
    subtreeBoundingBox: new THREE.Box3(new THREE.Vector3(min_x, min_y, min_z), new THREE.Vector3(max_x, max_y, max_z)),
    estimatedDrawCallCount: metadata.estimatedDrawCallCount || 0,
    estimatedRenderCost: metadata.estimatedTriangleCount || 0,

    // I3D
    indexFile: { ...metadata.indexFile },
    // F3D
    facesFile,

    // Populated later
    children: []
  };
}

function determineFacesFile(metadata: V8SceneSectorMetadata): SectorMetadataFacesFileSection {
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
      downloadSize: metadata.indexFile!.downloadSize
    };
  }
  const facesFile = {
    ...metadata.facesFile,
    recursiveCoverageFactors: metadata.facesFile.recursiveCoverageFactors || metadata.facesFile.coverageFactors
  };
  return facesFile;
}

function hasDummyFacesFileSection(metadata: V8SectorMetadata): boolean {
  return metadata.facesFile.coverageFactors.xy === -1.0;
}

function populateCoverageFactorsFromAnchestors(
  sector: V8SectorMetadata,
  validFacesFileSection: SectorMetadataFacesFileSection
) {
  if (hasDummyFacesFileSection(sector)) {
    sector.facesFile.coverageFactors.xy = validFacesFileSection.recursiveCoverageFactors.xy;
    sector.facesFile.coverageFactors.yz = validFacesFileSection.recursiveCoverageFactors.yz;
    sector.facesFile.coverageFactors.xz = validFacesFileSection.recursiveCoverageFactors.xz;
    sector.facesFile.recursiveCoverageFactors.xy = validFacesFileSection.recursiveCoverageFactors.xy;
    sector.facesFile.recursiveCoverageFactors.yz = validFacesFileSection.recursiveCoverageFactors.yz;
    sector.facesFile.recursiveCoverageFactors.xz = validFacesFileSection.recursiveCoverageFactors.xz;
    sector.children.forEach(child =>
      populateCoverageFactorsFromAnchestors(child as V8SectorMetadata, validFacesFileSection)
    );
  } else {
    sector.children.forEach(child =>
      populateCoverageFactorsFromAnchestors(child as V8SectorMetadata, sector.facesFile)
    );
  }
}
