/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';

import { SectorModel } from '../../datasources/cognitesdk';
import { createParser, createQuadsParser } from '../../models/sector/parseSectorData';
import { initializeThreeJsView } from './initializeThreeJsView';
import { Sector, SectorQuads } from '../../models/sector/types';
import { ConsumeSectorDelegate } from '../../models/sector/delegates';
import { createSyncedConsumeAndDiscard } from '../createSyncedConsumeAndDiscard';
import { initializeSectorLoader } from '../../models/sector/initializeSectorLoader';
import { SectorNode } from './SectorNode';
import { determineSectors } from '../../models/sector/determineSectors';

export default async function createThreeJsSectorNode(model: SectorModel): Promise<SectorNode> {
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = model;
  const [sectorRoot, modelTranformation] = await fetchSectorMetadata();
  const parseSectorData = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSectorQuadsData = await createQuadsParser();
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

  const [discardSectorFinal, consumeSectorFinal, consumeSectorQuadsFinal] = createSyncedConsumeAndDiscard(
    discardSector,
    consumeSectorAndTriggerRedraw,
    consumeSectorQuadsAndTriggerRedraw
  );

  const activateDetailedSectors = initializeSectorLoader(
    fetchSector,
    parseSectorData,
    discardSectorFinal,
    consumeSectorFinal
  );
  const activateSimpleSectors = initializeSectorLoader(
    fetchSectorQuads,
    parseSectorQuadsData,
    discardSectorFinal,
    consumeSectorQuadsFinal
  );

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
