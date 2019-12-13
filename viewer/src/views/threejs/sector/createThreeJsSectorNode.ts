/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';

import { createParser, createQuadsParser } from '../../../models/sector/parseSectorData';
import { initializeThreeJsView } from './initializeThreeJsView';
import { Sector, SectorQuads } from '../../../models/sector/types';
import { ConsumeSectorDelegate } from '../../../models/sector/delegates';
import { createSyncedConsumeAndDiscard } from '../../createSyncedConsumeAndDiscard';
import { initializeSectorLoader } from '../../../models/sector/initializeSectorLoader';
import { SectorNode } from './SectorNode';
import { determineSectors } from '../../../models/sector/determineSectors';
import { createCache } from '../../../models/createCache';
import { SectorModel } from '../../../datasources/SectorModel';

export async function createThreeJsSectorNode(model: SectorModel): Promise<SectorNode> {
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = model;

  // Fetch metadata
  const [sectorRoot, modelTranformation] = await fetchSectorMetadata();
  const parseSectorData = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSectorQuadsData = await createQuadsParser();

  // Setup ThreeJS geometry "consumption"
  const [rootGroup, discardSector, consumeSector, consumeSectorQuads] = initializeThreeJsView(
    sectorRoot,
    modelTranformation
  );
  const consumeSectorAndTriggerRedraw: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    consumeSector(sectorId, sector);
    rootGroup.needsRedraw = true;
  };
  const consumeSectorQuadsAndTriggerRedraw: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    consumeSectorQuads(sectorId, sector);
    rootGroup.needsRedraw = true;
  };

  // Create cache to avoid unnecessary loading and parsing of data
  const [fetchSectorCached, parseSectorDataCached] = createCache<number, Sector>(fetchSector, parseSectorData);
  const [fetchSectorQuadsCached, parseSectorQuadsDataCached] = createCache<number, SectorQuads>(
    fetchSectorQuads,
    parseSectorQuadsData
  );
  const activateDetailedSectors = initializeSectorLoader(
    fetchSectorCached,
    parseSectorDataCached,
    discardSector,
    consumeSector
  );
  const activateSimpleSectors = initializeSectorLoader(
    fetchSectorQuadsCached,
    parseSectorQuadsDataCached,
    discardSector,
    consumeSectorQuads
  );

  // Setup data load schedule whenever camera moves
  async function triggerUpdate(camera: THREE.Camera) {
    const wantedSectors = await determineSectors(sectorRoot, camera, modelTranformation);
    activateDetailedSectors(wantedSectors.detailed);
    activateSimpleSectors(wantedSectors.simple);
  }
  // Schedule sectors when camera moves
  const previousCameraMatrix = new THREE.Matrix4();
  previousCameraMatrix.elements[0] = Infinity; // Ensures inequality on first frame
  attachOnBeforeRender(rootGroup, async (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
    if (!previousCameraMatrix.equals(camera.matrixWorld)) {
      triggerUpdate(camera);
      previousCameraMatrix.copy(camera.matrixWorld);
    }
  });

  return rootGroup;
}

type OnBeforeRenderDelegate = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;

function attachOnBeforeRender(node: SectorNode, callback: OnBeforeRenderDelegate) {
  // onBeforeRender is only called for renderable nodes so we create a dummy-node
  const noEffectMaterial = new THREE.MeshBasicMaterial({
    depthWrite: false,
    colorWrite: false,
    stencilWrite: false
  });
  const onBeforeRenderTarget = new THREE.Mesh(new THREE.BoxGeometry(), noEffectMaterial);
  onBeforeRenderTarget.name = 'onBeforeRender()-target for loading sectors';
  onBeforeRenderTarget.frustumCulled = false;
  onBeforeRenderTarget.onBeforeRender = callback;
  node.add(onBeforeRenderTarget);
}
