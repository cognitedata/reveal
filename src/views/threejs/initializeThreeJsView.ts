/*!
 * Copyright 2019 Cognite AS
 */

import { SectorMetadata, SectorModelTransformation } from '../../sector/types';
import { buildScene } from './buildScene';
import { SectorNode } from './SectorNode';
import { traverseDepthFirst } from '../../utils/traversal';
import { DiscardSectorDelegate, ConsumeSectorDelegate } from '../../sector/delegates';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { toThreeMatrix4 } from './utilities';
import { Sector, SectorQuads } from '../../sector/types';

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

function findSectorMetadata(root: SectorMetadata, sectorId: number): SectorMetadata {
  let foundSector: SectorMetadata | null = null;
  traverseDepthFirst(root, sector => {
    if (sector.id === sectorId) {
      foundSector = sector;
    }
    return !foundSector;
  });
  if (!foundSector) {
    throw new Error(`Could not find metadata for sector ${sectorId} - invalid id?`);
  }
  return foundSector;
}
