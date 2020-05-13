/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { mat4, vec3 } from 'gl-matrix';
import { Box3 } from '../../utils/Box3';
import { SectorMetadata } from './types';
import { traverseDepthFirst } from '../../utils/traversal';
import { toThreeJsBox3, toThreeMatrix4 } from '../../views/threejs/utilities';

export interface SectorScene {
  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;

  readonly sectorCount: number;
  getSectorById(sectorId: number): SectorMetadata | undefined;
  getSectorsContainingPoint(p: vec3): SectorMetadata[];
  getSectorsIntersectingBox(b: Box3): SectorMetadata[];

  /**
   * Gets the sectors intersecting the frustum provided from the projection and inverse
   * camera matrix. Note that this function expects matrices in the the coordinate system
   * of the metadata. See below how to convert ThreeJS camera matrices to the correct format.
   *
   * @example Converting a ThreeJS camera to a frustum
   * const cameraMatrixWorldInverse = fromThreeMatrix(mat4.create(), camera.matrixWorldInverse);
   * const cameraProjectionMatrix = fromThreeMatrix(mat4.create(), camera.projectionMatrix);
   *
   * const transformedCameraMatrixWorldInverse =
   *   mat4.multiply(
   *     transformedCameraMatrixWorldInverse,
   *     cameraMatrixWorldInverse,
   *     model.modelTransformation.modelMatrix
   *   );
   *
   * const intersectingSectors = model.scene.getSectorsIntersectingFrustum(
   *   cameraProjectionMatrix,
   *   transformedCameraMatrixWorldInverse
   * );
   *
   * @param projectionMatrix
   * @param inverseCameraModelMatrix
   */
  getSectorsIntersectingFrustum(projectionMatrix: mat4, inverseCameraModelMatrix: mat4): SectorMetadata[];
  getAllSectors(): SectorMetadata[];

  // Available, but not supported:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
  // readonly unit: string | null;
}

export class SectorSceneImpl implements SectorScene {
  static createFromRootSector(version: number, maxTreeIndex: number, root: SectorMetadata): SectorScene {
    const sectorsById: Map<number, SectorMetadata> = new Map();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });
    return new SectorSceneImpl(version, maxTreeIndex, root, sectorsById);
  }

  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;
  private readonly sectors: Map<number, SectorMetadata>;

  constructor(version: number, maxTreeIndex: number, root: SectorMetadata, sectorsById: Map<number, SectorMetadata>) {
    this.version = version;
    this.maxTreeIndex = maxTreeIndex;
    this.root = root;
    this.sectors = sectorsById;
  }

  get sectorCount(): number {
    return this.sectors.size;
  }

  getSectorById(sectorId: number): SectorMetadata | undefined {
    return this.sectors.get(sectorId);
  }

  getAllSectors(): SectorMetadata[] {
    return [...this.sectors.values()];
  }

  getSectorsContainingPoint(p: vec3): SectorMetadata[] {
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.bounds.containsPoint(p)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getSectorsIntersectingBox(b: Box3): SectorMetadata[] {
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.bounds.intersectsBox(b)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getSectorsIntersectingFrustum(projectionMatrix: mat4, inverseCameraModelMatrix: mat4): SectorMetadata[] {
    const frustumMatrix = mat4.multiply(mat4.create(), projectionMatrix, inverseCameraModelMatrix);
    // This causes us to require ThreeJS, but I decided this was acceptable for now
    // as the dependency doesn't leak to the API and ThreeJS will be bundled anyways.
    const frustum = new THREE.Frustum().setFromProjectionMatrix(toThreeMatrix4(frustumMatrix));
    const bbox = new THREE.Box3();
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (frustum.intersectsBox(toThreeJsBox3(bbox, x.bounds))) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }
}
