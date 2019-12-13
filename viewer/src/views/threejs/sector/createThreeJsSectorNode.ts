/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';

import { createParser, createQuadsParser } from '../../../models/sector/parseSectorData';
import { Sector, SectorQuads } from '../../../models/sector/types';
import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../../../models/sector/delegates';
import { createSyncedConsumeAndDiscard } from '../../createSyncedConsumeAndDiscard';
import { initializeSectorLoader } from '../../../models/sector/initializeSectorLoader';
import { SectorNode } from './SectorNode';
import { determineSectors } from '../../../models/sector/determineSectors';
import { createCache } from '../../../models/createCache';
import { SectorModel } from '../../../datasources/SectorModel';
import { fromThreeMatrix, fromThreeVector3, toThreeMatrix4 } from '../utilities';
import { mat4, vec3, mat3 } from 'gl-matrix';
import { buildScene } from './buildScene';
import { findSectorMetadata } from '../../../models/sector/findSectorMetadata';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';

const tempVec3 = vec3.create();
const tempMatrix = mat4.create();
const tempMatrix2 = mat4.create();

export async function createThreeJsSectorNode(model: SectorModel): Promise<SectorNode> {
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = model;

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

  // Sync high- and low-detail geometry
  const [discardSectorFinal, consumeSectorFinal, consumeSectorQuadsFinal] = createSyncedConsumeAndDiscard(
    discard,
    consumeDetailed,
    consumeSimple
  );

  // Create cache to avoid unnecessary loading and parsing of data
  const [fetchSectorCached, parseSectorDataCached] = createCache<number, Sector>(fetchSector, parseSectorData);
  const [fetchSectorQuadsCached, parseSectorQuadsDataCached] = createCache<number, SectorQuads>(
    fetchSectorQuads,
    parseSectorQuadsData
  );
  const activateDetailedSectors = initializeSectorLoader(
    fetchSectorCached,
    parseSectorDataCached,
    discardSectorFinal,
    consumeSectorFinal
  );
  const activateSimpleSectors = initializeSectorLoader(
    fetchSectorQuadsCached,
    parseSectorQuadsDataCached,
    discardSectorFinal,
    consumeSectorQuadsFinal
  );

  function mat4FromMat3(out: mat4, a: mat3) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[4] = a[3];
    out[5] = a[4];
    out[6] = a[5];
    out[8] = a[6];
    out[9] = a[7];
    out[10] = a[8];
    return out;
  }

  // Setup data load schedule whenever camera moves
  async function triggerUpdate(camera: THREE.Camera) {
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse( camera.matrixWorld );

    const cameraPosition = fromThreeVector3(tempVec3, camera.position, modelTransformation);
    const cameraModelMatrix = fromThreeMatrix(tempMatrix, camera.matrixWorld, modelTransformation);
    const projectionMatrix = fromThreeMatrix(tempMatrix2, camera.projectionMatrix);
    const wantedSectors = await determineSectors({
      root: sectorRoot,
      cameraPosition,
      //inverseCameraModelMatrix,
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
