/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { WantedSectors, SectorMetadata, SectorModelTransformation } from './types';
import { traverseDepthFirst } from '../../utils/traversal';
import { toThreeMatrix4, toThreeVector3 } from '../../views/threejs/utilities';
import { mat4, vec3 } from 'gl-matrix';

const tempMatrix = mat4.create();
const tempMatrix2 = mat4.create();

interface DetermineSectorsInput {
  root: SectorMetadata;
  cameraPosition: vec3;
  cameraModelMatrix: mat4;
  projectionMatrix: mat4;
}

export async function determineSectors(input: DetermineSectorsInput): Promise<WantedSectors> {
  const { root, cameraPosition, cameraModelMatrix, projectionMatrix } = input;

  const sectors: SectorMetadata[] = [];

  const frustum = new THREE.Frustum();
  const frustumMatrix = mat4.multiply(tempMatrix, projectionMatrix, mat4.invert(tempMatrix2, cameraModelMatrix)!);
  frustum.setFromMatrix(toThreeMatrix4(frustumMatrix));

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
    return bbox.distanceToPoint(toThreeVector3(cameraPosition));
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
