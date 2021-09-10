/*!
 * Copyright 2021 Cognite AS
 */
import { SectorCost } from './types';
import { LevelOfDetail } from '../LevelOfDetail';
import { SectorMetadata } from '../types';

export function computeSectorCost(metadata: SectorMetadata, lod: LevelOfDetail): SectorCost {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return {
        downloadSize: metadata.indexFile.downloadSize,
        drawCalls: metadata.estimatedDrawCallCount
      };
    case LevelOfDetail.Simple:
      return { downloadSize: metadata.facesFile.downloadSize, drawCalls: 1 };
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
