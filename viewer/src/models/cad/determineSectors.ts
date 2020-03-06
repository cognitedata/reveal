/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { WantedSectors, SectorMetadata, SectorScene, DetermineSectorsInput } from './types';
import { traverseDepthFirst, traverseUpwards } from '../../utils/traversal';
import { toThreeMatrix4, toThreeVector3 } from '../../views/threejs/utilities';
import { mat4 } from 'gl-matrix';
import { defaultLoadingHints as defaultCadLoadingHints } from './CadLoadingHints';

const degToRadFactor = Math.PI / 180;

const determineSectorsPreallocatedVars = {
  invertCameraModelMatrix: mat4.create(),
  frustumMatrix: mat4.create(),
  frustum: new THREE.Frustum(),
  bbox: new THREE.Box3(),
  min: new THREE.Vector3(),
  max: new THREE.Vector3()
};

export function defaultDetermineSectors(params: DetermineSectorsInput): WantedSectors {
  const hints = { ...defaultCadLoadingHints, ...(params.loadingHints || {}) };

  const { scene, cameraPosition, cameraModelMatrix, projectionMatrix, cameraFov } = params;
  const { invertCameraModelMatrix, frustumMatrix, frustum, bbox, min, max } = determineSectorsPreallocatedVars;

  const sectors: SectorMetadata[] = [];
  const distanceToCameraVars = {
    threeJsVec3: new THREE.Vector3()
  };

  function distanceToCamera(s: SectorMetadata) {
    const { threeJsVec3 } = distanceToCameraVars;
    min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
    max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
    bbox.makeEmpty();
    bbox.expandByPoint(min);
    bbox.expandByPoint(max);
    return bbox.distanceToPoint(toThreeVector3(threeJsVec3, cameraPosition));
  }

  if (!mat4.invert(invertCameraModelMatrix, cameraModelMatrix)) {
    throw new Error('Provided camera model matrix is not invertible');
  }
  mat4.multiply(frustumMatrix, projectionMatrix, invertCameraModelMatrix);
  frustum.setFromMatrix(toThreeMatrix4(frustumMatrix));

  traverseDepthFirst(scene.root, sector => {
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
    const quadSize = (() => {
      if (!sector.simple) {
        // Making the quad infinite in size means we will always use the detailed version instead
        return Infinity;
      }
      return sector.simple.gridIncrement;
    })();

    if (quadSize < largestAllowedQuadSize) {
      return false;
    }

    sectors.push(sector);
    return true;
  });

  // TODO 2020-01-21 larsmoa: Waste since we add sectors in a set below
  sectors.sort((l, r) => {
    return distanceToCamera(l) - distanceToCamera(r);
  });
  const requestedDetailed = new Set<number>(sectors.map(x => x.id));
  const result = determineSectorsQuality(scene, requestedDetailed);
  return result;
}

export function determineSectorsQuality(scene: SectorScene, requestedDetailed: Set<number>): WantedSectors {
  const simple: number[] = [];
  const detailed: number[] = [];

  for (const sectorId of requestedDetailed) {
    const sector = scene.sectors.get(sectorId);
    if (!sector) {
      throw new Error(`Could not find sector with ID ${sectorId}`);
    }
    traverseUpwards(sector, (other: SectorMetadata) => {
      detailed.push(other.id);
      return true;
    });
  }

  traverseDepthFirst(scene.root, sector => {
    if (detailed.includes(sector.id)) {
      return true;
    }
    simple.push(sector.id);
    return false;
  });

  return {
    detailed: new Set<number>(detailed),
    simple: new Set<number>(simple)
  };
}
