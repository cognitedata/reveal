/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';

import { createParser, createQuadsParser } from '../../../models/sector/parseSectorData';
import { Sector, SectorQuads } from '../../../models/sector/types';
import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../../../models/sector/delegates';
import { initializeSectorLoader } from '../../../models/sector/initializeSectorLoader';
import { SectorNode } from './SectorNode';
import { determineSectors } from '../../../models/sector/determineSectors';
import { createCache } from '../../../models/createCache';
import { SectorModel } from '../../../datasources/SectorModel';
import { fromThreeMatrix, fromThreeVector3, toThreeMatrix4 } from '../utilities';
import { mat4, vec3 } from 'gl-matrix';
import { buildScene } from './buildScene';
import { findSectorMetadata } from '../../../models/sector/findSectorMetadata';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';

const createThreeJsSectorNodeVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export async function createThreeJsSectorNode(model: SectorModel): Promise<SectorNode> {
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = model;
  const { cameraPosition, cameraModelMatrix, projectionMatrix } = createThreeJsSectorNodeVars;
  // Fetch metadata
  const [sectorRoot, modelTransformation] = await fetchSectorMetadata();
  const parseSectorData = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSectorQuadsData = await createQuadsParser();

  // Setup ThreeJS geometry "consumption"
  const sectorNodeMap = new Map<number, SectorNode>();
  const rootGroup = new SectorNode({ modelTransformation });
  rootGroup.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
  buildScene(sectorRoot, rootGroup, sectorNodeMap);

  const consumeDetailed: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    rootGroup.needsRedraw = true;

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
  const consumeSimple: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    const sectorNode = sectorNodeMap.get(sectorId);
    if (!sectorNode) {
      throw new Error(`Could not find 3D node for sector ${sectorId} - invalid id?`);
    }

    rootGroup.needsRedraw = true;

    const metadata = findSectorMetadata(sectorRoot, sectorId);
    consumeSectorSimple(sectorId, sector, metadata, sectorNode);
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
    discard,
    consumeDetailed
  );
  const activateSimpleSectors = initializeSectorLoader(
    fetchSectorQuadsCached,
    parseSectorQuadsDataCached,
    discard,
    consumeSimple
  );

  // Setup data load schedule whenever camera moves
  async function triggerUpdate(camera: THREE.Camera) {
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    fromThreeVector3(cameraPosition, camera.position, modelTransformation);
    fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, modelTransformation);
    fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
    const wantedSectors = await determineSectors({
      root: sectorRoot,
      cameraPosition,
      cameraModelMatrix,
      projectionMatrix
    });
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
