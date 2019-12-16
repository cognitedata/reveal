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
import { createCache, createSimpleCache } from '../../../models/createCache';
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
  const parseDetailed = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSimple = await createQuadsParser();

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

  let redrawRequested = false;
  const requestRedraw = () => {
    redrawRequested = true;
  };
  const activatorDetailed = initializeSectorLoader(getDetailedCache.request, discard, consumeDetailed, requestRedraw);
  const activatorSimple = initializeSectorLoader(getSimpleCache.request, discard, consumeSimple, requestRedraw);

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

  // Schedule sectors when camera moves
  const previousCameraMatrix = new THREE.Matrix4();
  previousCameraMatrix.elements[0] = Infinity; // Ensures inequality on first frame
  rootGroup.update = async (camera: THREE.Camera) => {
    let needsRedraw = false;
    if (!previousCameraMatrix.equals(camera.matrixWorld)) {
      camera.updateMatrix();
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      const cameraPosition = fromThreeVector3(tempVec3, camera.position, modelTransformation);
      const cameraModelMatrix = fromThreeMatrix(tempMatrix, camera.matrixWorld, modelTransformation);
      const projectionMatrix = fromThreeMatrix(tempMatrix2, camera.projectionMatrix);
      const wantedSectors = await determineSectors({
        root: sectorRoot,
        cameraPosition,
        // inverseCameraModelMatrix,
        cameraModelMatrix,
        projectionMatrix
      });
      needsRedraw = activatorDetailed.update(wantedSectors.detailed) || needsRedraw;
      needsRedraw = activatorSimple.update(wantedSectors.simple) || needsRedraw;
      previousCameraMatrix.copy(camera.matrixWorld);
    }
    needsRedraw = activatorDetailed.refresh() || needsRedraw;
    needsRedraw = activatorSimple.refresh() || needsRedraw;
    needsRedraw = needsRedraw || redrawRequested;
    redrawRequested = false;
    return needsRedraw;
  };

  return rootGroup;
}
