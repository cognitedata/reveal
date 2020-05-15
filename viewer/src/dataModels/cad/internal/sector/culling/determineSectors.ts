/*!
 * Copyright 2020 Cognite AS
 */

// TODO try to implement all functionality that three.js provides here without three.js to avoid
// pulling it in just for this reason
import * as THREE from 'three';
import { SectorMetadata } from '../types';
import { traverseDepthFirst, traverseUpwards } from '../../../../../utilities/traversal';
import { toThreeMatrix4, toThreeVector3 } from '../../../../../utilities/utilities';
import { mat4 } from 'gl-matrix';
import { defaultLoadingHints as defaultCadLoadingHints, CadLoadingHints } from '../../../public/CadLoadingHints';
import { WantedSector } from '../WantedSector';
import { LevelOfDetail } from '../LevelOfDetail';
import { CameraConfig } from '../../../../../utilities/fromThreeCameraConfig';
import { CadModelMetadata } from '../..';

const degToRadFactor = Math.PI / 180;

const determineSectorsPreallocatedVars = {
  invertCameraModelMatrix: mat4.create(),
  frustumMatrix: mat4.create(),
  frustum: new THREE.Frustum(),
  bbox: new THREE.Box3(),
  min: new THREE.Vector3(),
  max: new THREE.Vector3()
};

export interface DetermineSectorsByProximityInput {
  cameraConfig: CameraConfig;
  cadModels: CadModel[];
  loadingHints: CadLoadingHints;
}
/*
export interface DetermineSectorsByProximityInput {
  readonly sectorScene: SectorScene;
  readonly cameraFov: number;
  readonly cameraPosition: vec3;
  readonly cameraModelMatrix: mat4;
  readonly projectionMatrix: mat4;
  readonly loadingHints?: CadLoadingHints;
}
*/

export function determineSectorsByProximity(params: DetermineSectorsByProximityInput): WantedSector[] {
  const hints = { ...defaultCadLoadingHints, ...(params.loadingHints || {}) };

  const { cameraPosition, cameraModelMatrix, projectionMatrix, cameraFov } = params.cameraConfig;
  const distanceToCameraVars = {
    threeJsVec3: new THREE.Vector3()
  };
  const { invertCameraModelMatrix, frustumMatrix, frustum, bbox, min, max } = determineSectorsPreallocatedVars;
  function distanceToCamera(s: SectorMetadata) {
    const { threeJsVec3 } = distanceToCameraVars;
    min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
    max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
    bbox.makeEmpty();
    bbox.expandByPoint(min);
    bbox.expandByPoint(max);
    return bbox.distanceToPoint(toThreeVector3(threeJsVec3, cameraPosition));
  }

  const result: WantedSector[] = [];
  for (const cadModel of params.cadModels) {
    const sectorScene = cadModel.scene;
    const sectors: SectorMetadata[] = [];

    if (!mat4.invert(invertCameraModelMatrix, cameraModelMatrix)) {
      throw new Error('Provided camera model matrix is not invertible');
    }
    mat4.multiply(frustumMatrix, projectionMatrix, invertCameraModelMatrix);
    frustum.setFromProjectionMatrix(toThreeMatrix4(frustumMatrix));

    traverseDepthFirst(sectorScene.root, sector => {
      min.set(sector.bounds.min[0], sector.bounds.min[1], sector.bounds.min[2]);
      max.set(sector.bounds.max[0], sector.bounds.max[1], sector.bounds.max[2]);
      bbox.makeEmpty();
      bbox.expandByPoint(min);
      bbox.expandByPoint(max);

      if (!frustum.intersectsBox(bbox)) {
        return false;
      }

      const screenHeight = 2.0 * distanceToCamera(sector) * Math.tan((cameraFov / 2) * degToRadFactor);
      const largestAllowedQuadSize = hints.maxQuadSize * screenHeight; // no larger than x percent of the height
      const quadSize = sector.facesFile.quadSize;
      if (quadSize < largestAllowedQuadSize) {
        return false;
      }

      sectors.push(sector);
      return true;
    });

    const requestedDetailed = new Set<number>(sectors.map(x => x.id));
    const wanteds: WantedSector[] = determineSectorsFromDetailed(cadModel, requestedDetailed);
    for (const wanted of wanteds) {
      result.push(wanted);
    }
  }
  result.sort((l, r) => {
    // TODO 2020-03-22 larsmoa: Optimize to improve performance of determineSectors.
    const leftMetadata = l.scene.getSectorById(l.metadata.id)!;
    const rightMetdata = r.scene.getSectorById(r.metadata.id)!;
    return distanceToCamera(leftMetadata) - distanceToCamera(rightMetdata);
  });
  return result;
}

export function determineSectorsFromDetailed(cadModel: CadModelMetadata, requestedDetailed: Set<number>): WantedSector[] {
  const simple: number[] = [];
  const detailed: number[] = [];
  const wanted: WantedSector[] = [];
  const scene = cadModel.scene;

  for (const sectorId of requestedDetailed) {
    const sector = scene.getSectorById(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }
    traverseUpwards(sector, (other: SectorMetadata) => {
      if (detailed.includes(other.id)) {
        return false;
      }
      wanted.push({
        blobUrl: cadModel.blobUrl,
        cadModelTransformation: cadModel.modelTransformation,
        scene: cadModel.scene,
        levelOfDetail: LevelOfDetail.Detailed,
        metadata: other
      });
      detailed.push(other.id);
      return true;
    });
  }

  traverseDepthFirst(scene.root, sector => {
    if (detailed.includes(sector.id)) {
      return true;
    }
    // F3D file is omitted if there is no geometry in the file
    if (sector.facesFile.fileName) {
      simple.push(sector.id);
      wanted.push({
        blobUrl: cadModel.blobUrl,
        cadModelTransformation: cadModel.modelTransformation,
        scene: cadModel.scene,
        levelOfDetail: LevelOfDetail.Simple,
        metadata: sector
      });
    }
    return false;
  });

  traverseDepthFirst(scene.root, sector => {
    if (!detailed.includes(sector.id) && !simple.includes(sector.id)) {
      wanted.push({
        blobUrl: cadModel.blobUrl,
        cadModelTransformation: cadModel.modelTransformation,
        scene: cadModel.scene,
        levelOfDetail: LevelOfDetail.Discarded,
        metadata: sector
      });
    }
    return true;
  });

  return wanted;
}
