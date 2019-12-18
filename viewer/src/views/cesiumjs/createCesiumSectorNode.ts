/*!
 * Copyright 2019 Cognite AS
 */

import * as Cesium from 'cesium';
import * as THREE from 'three';

import { createParser, createQuadsParser } from '../../models/sector/parseSectorData';
import { Sector, SectorModelTransformation } from '../../models/sector/types';
import { initializeSectorLoader } from '../../models/sector/initializeSectorLoader';
import { createSimpleCache } from '../../models/createCache';
import { initializeCesiumView } from './initializeCesiumView';
import { fromCesiumMatrix4, toCartesian3 as toCesiumCartesian3 } from './utilities';
import { mat4, vec3 } from 'gl-matrix';
import { traverseDepthFirst } from '../../utils/traversal';
import { SectorModel } from '../..';

/**
 * Column major rotation from right-handed Y up (e.g. ThreeJS) to left-handed Z up (Cesium)
 */
const yUpToZup = mat4.fromValues(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
/**
 * Inverse transform of `yUpToZup`.
 */
const zUpToYup = mat4.identity(mat4.create()); // mat4.invert(mat4.create(), yUpToZup)!;

/**
 *
 * @param geographicOrigin Geographic origin, typically created from lat/long using
 *                         `Cesium.Cartesian3.fromDegrees`.
 * @param modelOffset      Offset in model space.
 * @param model
 * @param scene
 */
export default async function initializeCesiumSectorScene(
  geographicOrigin: Cesium.Cartesian3,
  modelOffset: Cesium.Cartesian3,
  model: SectorModel,
  scene: Cesium.Scene
): Promise<[Cesium.BoundingSphere, SectorModelTransformation]> {
  const [fetchSectorMetadata, fetchSector, fetchSectorQuads, fetchCtmFile] = model;
  // Fetch metadata
  const [sectorRoot, modelTransformation] = await fetchSectorMetadata();
  const parseSectorData = await createParser(sectorRoot, fetchSector, fetchCtmFile);
  const parseSectorQuadsData = await createQuadsParser();

  // Position model to have origin at given position, and convert from left-handed Y up to
  // right-handed Z up
  const modelTransformWithZup = mat4.mul(mat4.create(), modelTransformation.modelMatrix, yUpToZup);
  const referenceMatrix = fromCesiumMatrix4(Cesium.Transforms.eastNorthUpToFixedFrame(geographicOrigin));
  const modelMatrix = mat4.create();
  mat4.mul(modelMatrix, modelTransformWithZup, referenceMatrix);
  mat4.translate(modelMatrix, modelMatrix, [modelOffset.x, modelOffset.y, modelOffset.z]);
  const cesiumModelTransformation = {
    modelMatrix,
    inverseModelMatrix: mat4.invert(mat4.create(), modelMatrix)!
  };

  // Setup ThreeJS geometry "consumption"
  const [discardSector, consumeSector, consumeSectorQuads] = initializeCesiumView(
    sectorRoot,
    cesiumModelTransformation,
    scene.primitives
  );

  const getDetailed = async (sectorId: number) => {
    const data = await fetchSector(sectorId);
    return parseSectorData(sectorId, data);
  };

  // Create cache to avoid unnecessary loading and parsing of data
  const getDetailedCached = createSimpleCache(getDetailed);

  const activatorDetailed = initializeSectorLoader(getDetailedCached.request, discardSector, consumeSector);

  // TODO 2019-11-12 larsmoa: Add support for low detail geometry to cesium.
  // const [fetchSectorQuadsCached, parseSectorQuadsDataCached] = createCache<number, SectorQuads>(
  //   fetchSectorQuads,
  //   parseSectorQuadsData
  // );
  // const activateSimpleSectors = initializeSectorLoader(
  //   fetchSectorQuadsCached,
  //   parseSectorQuadsDataCached,
  //   discardSectorFinal,
  //   consumeSectorQuadsFinal
  // );

  // Setup data load schedule whenever camera moves
  async function triggerUpdate(camera: Cesium.Camera) {
    // TODO 2019-11-12 larsmoa: Determine sectors in frustum based on the camera
    const wantedSectors = new Set<number>();
    traverseDepthFirst(sectorRoot, x => {
      wantedSectors.add(x.id);
      return true;
    });
    activatorDetailed.update(wantedSectors);

    // TODO IMPORTANT activatorDetailed.refresh is never called!
  }
  // Schedule sectors when camera moves
  const previousCameraMatrix = new THREE.Matrix4();
  previousCameraMatrix.elements[0] = Infinity; // Ensures inequality on first frame
  scene.preUpdate.addEventListener((s: Cesium.Scene) => {
    triggerUpdate(s.camera);
  });

  const bounds = sectorRoot.bounds;
  const min = vec3.transformMat4(vec3.create(), bounds.min, cesiumModelTransformation.modelMatrix);
  const max = vec3.transformMat4(vec3.create(), bounds.max, cesiumModelTransformation.modelMatrix);
  return [
    // TODO 2019-11-08 larsmoa: Remove ignore
    // @ts-ignore
    Cesium.BoundingSphere.fromCornerPoints(toCesiumCartesian3(min), toCesiumCartesian3(max)),
    cesiumModelTransformation
  ];
}
