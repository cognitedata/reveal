/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata, SectorModelTransformation } from './types';
import { traverseDepthFirst } from '../utils/traversal';
import { toThreeMatrix4 } from '../views/threejs/utilities';

export async function determineSectors(
  root: SectorMetadata,
  camera: THREE.Camera,
  modelTranformation: SectorModelTransformation
): Promise<Set<number>> {
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

  function distanceToCamera(s: SectorMetadata) {
    min.set(s.bounds.min[0], s.bounds.min[1], s.bounds.min[2]);
    max.set(s.bounds.max[0], s.bounds.max[1], s.bounds.max[2]);
    bbox.makeEmpty();
    bbox.expandByPoint(min);
    bbox.expandByPoint(max);
    return bbox.distanceToPoint(camera.getWorldPosition(camera.position));
  }
  sectors.sort((l, r) => {
    return distanceToCamera(l) - distanceToCamera(r);
  });
  return new Set<number>(sectors.slice(0, 50).map(x => x.id));
}
