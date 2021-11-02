/*!
 * Copyright 2021 Cognite AS
 */
import { SectorCost } from './types';

import {
  BaseSectorMetadata,
  GltfSectorMetadata,
  LevelOfDetail,
  SectorMetadata,
  V8SectorMetadata
} from '@reveal/cad-parsers';

export function computeGltfSectorCost(sectorMetadata: SectorMetadata, lod: LevelOfDetail): SectorCost {
  const metadata = sectorMetadata as BaseSectorMetadata & GltfSectorMetadata;
  switch (lod) {
    case LevelOfDetail.Detailed:
      return {
        downloadSize: metadata.downloadSize,
        drawCalls: metadata.estimatedDrawCallCount,
        renderCost: metadata.estimatedRenderCost
      };
    case LevelOfDetail.Simple:
      throw new Error('Not supported');

    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}

export function computeV8SectorCost(sectorMetadata: SectorMetadata, lod: LevelOfDetail): SectorCost {
  const metadata = sectorMetadata as BaseSectorMetadata & V8SectorMetadata;
  switch (lod) {
    case LevelOfDetail.Detailed:
      return {
        downloadSize: metadata.facesFile.downloadSize,
        drawCalls: metadata.estimatedDrawCallCount,
        renderCost: metadata.estimatedRenderCost
      };
    case LevelOfDetail.Simple:
      throw new Error('Not supported');

    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}

function isV8Sector(sector: SectorMetadata): sector is BaseSectorMetadata & V8SectorMetadata {
  const s = sector as Partial<BaseSectorMetadata & V8SectorMetadata>;
  return s.facesFile !== undefined || s.indexFile !== undefined;
}

function isGltfSector(sector: SectorMetadata): sector is BaseSectorMetadata & V8SectorMetadata {
  const s = sector as Partial<BaseSectorMetadata & V8SectorMetadata>;
  return s.facesFile !== undefined || s.indexFile !== undefined;
}

export function computeSectorCostForV8OrGLTF(sectorMetadata: SectorMetadata, lod: LevelOfDetail) {
  if (isV8Sector(sectorMetadata)) {
    return computeV8SectorCost(sectorMetadata, lod);
  } else if (isGltfSector(sectorMetadata)) {
    return computeGltfSectorCost(sectorMetadata, lod);
  }
  throw new Error(`Sector ${sectorMetadata.id} is not at V8 or GLTF (V9) sector`);
}
