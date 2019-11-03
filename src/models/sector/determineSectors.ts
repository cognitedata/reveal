/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { WantedSectors, SectorMetadata, SectorModelTransformation } from './types';
import { traverseDepthFirst } from '../../utils/traversal';
import { toThreeMatrix4 } from '../../views/threejs/utilities';

export async function determineSectors(
  root: SectorMetadata,
  camera: THREE.Camera,
  modelTranformation: SectorModelTransformation
): Promise<WantedSectors> {
  const sectors: SectorMetadata[] = [];

  const matrix = new THREE.Matrix4()
    .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    .multiply(toThreeMatrix4(modelTranformation.modelMatrix));
  const frustum = new THREE.Frustum().setFromMatrix(matrix);

  const bbox = new THREE.Box3();
  const min = new THREE.Vector3();
  const max = new THREE.Vector3();

  traverseDepthFirst(root, sector => {
    min.set(sector.bounds.min[0], sector.bounds.min[1], sector.bounds.min[2]);
    max.set(sector.bounds.max[0], sector.bounds.max[1], sector.bounds.max[2]);
    bbox.makeEmpty();
    bbox.expandByPoint(min);
    bbox.expandByPoint(max);

    if (frustum.intersectsBox(bbox)) {
      sectors.push(sector);
      return true;
    }
    return false;
  });

  const inverseMatrix = new THREE.Matrix4().getInverse(toThreeMatrix4(modelTranformation.modelMatrix));
  const cameraPosition = camera.position.clone().applyMatrix4(inverseMatrix);

  function distanceToCamera(s: SectorMetadata) {
    min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
    max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
    bbox.makeEmpty();
    bbox.expandByPoint(min);
    bbox.expandByPoint(max);
    return bbox.distanceToPoint(cameraPosition);
  }
  sectors.sort((l, r) => {
    return distanceToCamera(l) - distanceToCamera(r);
  });
  const definitelyDetailed = new Set<number>(sectors.slice(0, 30).map(x => x.id));
  const result = determineSectorsQuality(root, definitelyDetailed);
  return result;
}

function determineSectorsQuality(root: SectorMetadata, detailedSectors: Set<number>): WantedSectors {
  const simple: number[] = [];
  const pending: number[] = [];
  const detailed: number[] = [];
  traverseDepthFirst(root, sector => {
    pending.push(sector.id);
    if (detailedSectors.has(sector.id)) {
      detailed.push(...pending);
      pending.length = 0;
    }
    if (sector.children.length === 0) {
      if (pending.length > 0) {
        simple.push(pending[0]);
      }
      pending.length = 0;
      return false;
    }
    return true;
  });

  return {
    detailed: new Set<number>(detailed),
    simple: new Set<number>(simple)
  };
}
