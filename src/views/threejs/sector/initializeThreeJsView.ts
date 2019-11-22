/*!
 * Copyright 2019 Cognite AS
 */

import { SectorMetadata, SectorModelTransformation } from '../../../models/sector/types';
import { buildScene } from './buildScene';
import { SectorNode } from './SectorNode';
import { DiscardSectorDelegate, ConsumeSectorDelegate } from '../../../models/sector/delegates';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { toThreeMatrix4 } from '../utilities';
import { Sector, SectorQuads } from '../../../models/sector/types';
import { findSectorMetadata } from '../../../models/sector/findSectorMetadata';

export function initializeThreeJsView(
  sectorRoot: SectorMetadata,
  modelTransformation: SectorModelTransformation
): [SectorNode, DiscardSectorDelegate, ConsumeSectorDelegate<Sector>, ConsumeSectorDelegate<SectorQuads>] {
  const sectorNodeMap = new Map<number, SectorNode>();
  const rootGroup = new SectorNode();
  rootGroup.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
  buildScene(sectorRoot, rootGroup, sectorNodeMap);

  const consume: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    const metadata = findSectorMetadata(sectorRoot, sectorId);
    consumeSectorDetailed(sectorId, sector, metadata, sectorNode);
  };
  const discard: DiscardSectorDelegate = (sectorId, request) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    discardSector(sectorId, request, sectorNode);
  };
  const consumeQuads: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    const metadata = findSectorMetadata(sectorRoot, sectorId);
    consumeSectorSimple(sectorId, sector, metadata, sectorNode);
  };
  return [rootGroup, discard, consume, consumeQuads];
}
