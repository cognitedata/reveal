/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads } from '../../../models/cad/types';
import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../../../models/cad/delegates';
import { initializeSectorLoader } from '../../../models/cad/initializeSectorLoader';
import { SectorNode, RootSectorNodeData } from './SectorNode';
import { createSimpleCache } from '../../../models/createCache';
import { CadModel } from '../../../models/cad/CadModel';
import { buildScene } from './buildScene';
import { findSectorMetadata } from '../../../models/cad/findSectorMetadata';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';
import { defaultDetermineSectors } from '../../../models/cad/determineSectors';
import { toThreeMatrix4 } from '../utilities';
import { Materials } from './materials';

export function createThreeJsSectorNode(model: CadModel, materials: Materials): RootSectorNodeData {
  const { fetchSectorDetailed, fetchSectorSimple, scene, modelTransformation, parseSimple, parseDetailed } = model;
  // Fetch metadata
  const sectorNodeMap = new Map<number, SectorNode>(); // Populated by buildScene() below

  const consumeDetailed: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    const metadata = findSectorMetadata(scene.root, sectorId);
    consumeSectorDetailed(sectorId, sector, metadata, sectorNode, materials);
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

    const metadata = findSectorMetadata(scene.root, sectorId);
    consumeSectorSimple(sectorId, sector, metadata, sectorNode, materials);
  };

  const getDetailed = async (sectorId: number) => {
    const data = await fetchSectorDetailed(sectorId);
    return parseDetailed(sectorId, data);
  };

  const getSimple = async (sectorId: number) => {
    const data = await fetchSectorSimple(sectorId);
    return parseSimple(sectorId, data);
  };

  const getDetailedCache = createSimpleCache(getDetailed);
  const getSimpleCache = createSimpleCache(getSimple);
  const detailedActivator = initializeSectorLoader(getDetailedCache.request, discard, consumeDetailed);
  const simpleActivator = initializeSectorLoader(getSimpleCache.request, discard, consumeSimple);
  const rootSector = new SectorNode(0, '/');
  rootSector.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
  buildScene(scene.root, rootSector, sectorNodeMap);

  return {
    rootSector,
    simpleActivator,
    detailedActivator
  };
}
