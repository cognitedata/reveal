/*!
 * Copyright 2021 Cognite AS
 */
import { SectorCost } from './types';

import { LevelOfDetail, SectorMetadata, V8SectorMetadata, V9SectorMetadata } from '@reveal/cad-parsers';

export function computeV9SectorCost(sectorMetadata: SectorMetadata, lod: LevelOfDetail): SectorCost {
  const metadata = sectorMetadata as V9SectorMetadata;
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
  const metadata = sectorMetadata as V8SectorMetadata;
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
