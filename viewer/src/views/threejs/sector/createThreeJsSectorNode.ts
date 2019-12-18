/*!
 * Copyright 2019 Cognite AS
 */

import { createParser, createQuadsParser } from '../../../models/sector/parseSectorData';
import { Sector, SectorQuads } from '../../../models/sector/types';
import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../../../models/sector/delegates';
import { initializeSectorLoader } from '../../../models/sector/initializeSectorLoader';
import { SectorNode, RootSectorNode } from './SectorNode';
import { createSimpleCache } from '../../../models/createCache';
import { SectorModel } from '../../../datasources/SectorModel';
import { toThreeMatrix4 } from '../utilities';
import { buildScene } from './buildScene';
import { findSectorMetadata } from '../../../models/sector/findSectorMetadata';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';

export async function createThreeJsSectorNode(model: SectorModel): Promise<RootSectorNode> {
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = model;
  // Fetch metadata
  const [sectorRoot, modelTransformation] = await fetchSectorMetadata();
  const parseDetailed = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSimple = await createQuadsParser();
  const sectorNodeMap = new Map<number, SectorNode>(); // Populated by buildScene() below

  const consumeDetailed: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    const metadata = findSectorMetadata(sectorRoot, sectorId);
    consumeSectorDetailed(sectorId, sector, metadata, sectorNode);
  };
  const discard: DiscardSectorDelegate = sectorId => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }
    discardSector(sectorId, sectorNode);
  };
  const consumeSimple: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    const metadata = findSectorMetadata(sectorRoot, sectorId);
    consumeSectorSimple(sectorId, sector, metadata, sectorNode);
  };

  const getDetailed = async (sectorId: number) => {
    const data = await fetchSector(sectorId);
    return parseDetailed(sectorId, data);
  };

  const getSimple = async (sectorId: number) => {
    const data = await fetchSectorQuads(sectorId);
    return parseSimple(sectorId, data);
  };

  const getDetailedCache = createSimpleCache(getDetailed);
  const getSimpleCache = createSimpleCache(getSimple);

  const activatorDetailed = initializeSectorLoader(getDetailedCache.request, discard, consumeDetailed);
  const activatorSimple = initializeSectorLoader(getSimpleCache.request, discard, consumeSimple);
  const rootGroup = new RootSectorNode(sectorRoot, modelTransformation, activatorSimple, activatorDetailed);
  rootGroup.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
  buildScene(sectorRoot, rootGroup, sectorNodeMap);

  return rootGroup;
}
