/*!
 * Copyright 2021 Cognite AS
 */
import { SectorCost } from './types';

import { LevelOfDetail, SectorMetadata } from '@reveal/cad-parsers';

export function computeSectorCost(metadata: SectorMetadata, lod: LevelOfDetail): SectorCost {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return {
        downloadSize: metadata.indexFile.downloadSize,
        drawCalls: metadata.estimatedDrawCallCount,
        renderCost: metadata.estimatedRenderCost
      };
    case LevelOfDetail.Simple:
      return {
        downloadSize: metadata.facesFile.downloadSize,
        drawCalls: 1,
        // TODO 2021-09-23 larsmoa: Estimate for simple sector render cost is very arbitrary
        renderCost: Math.ceil(metadata.facesFile.downloadSize / 100)
      };
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
