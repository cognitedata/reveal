/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { computeNdcAreaOfBox } from './computeNdcAreaOfBox';

import { SectorMetadata, V9SectorMetadata } from '@reveal/cad-parsers';
import { PrioritizedArea } from '@reveal/cad-styling';

const preallocated = {
  transformedBounds: new THREE.Box3()
};

type ModifiedFrustum = {
  near: number;
  far: number;
  weight: number;
  frustum: THREE.Frustum;
};

export class WeightFunctionsHelper {
  private readonly _camera: THREE.PerspectiveCamera;
  private _minSectorDistance: number = Infinity;
  private _maxSectorDistance: number = -Infinity;
  private readonly _modifiedFrustums: ModifiedFrustum[];

  constructor(camera: THREE.PerspectiveCamera) {
    this._camera = camera;

    // Create modified projection matrices to add heuristic of how "deep" in the frustum sectors are located
    // This is done to avoid loading too much geometry from sectors we are barely inside and prioritize
    // loading of geometry
    const { near, far } = camera;
    const nearFarRange = far - near;
    this._modifiedFrustums = [
      { near, far: near + 0.05 * nearFarRange, weight: 0.1 }, // 0-5% of frustum
      { near: near + 0.05 * nearFarRange, far: near + 0.4 * nearFarRange, weight: 0.7 }, // 5-40% of frustum
      { near: near + 0.4 * nearFarRange, far: near + 1.0 * nearFarRange, weight: 0.2 } // 40-100% of frustum
    ].map(modifiedFrustum => {
      const projectionMatrix = createModifiedProjectionMatrix(camera, modifiedFrustum.near, modifiedFrustum.far);
      const frustumMatrix = new THREE.Matrix4().multiplyMatrices(projectionMatrix, this._camera.matrixWorldInverse);
      const frustum = new THREE.Frustum().setFromProjectionMatrix(frustumMatrix);
      return {
        ...modifiedFrustum,
        frustum
      };
    });
  }

  addCandidateSectors(sectors: SectorMetadata[], modelMatrix: THREE.Matrix4) {
    // Note! We compute distance to camera, not screen (which would probably be better)
    const { minDistance, maxDistance } = sectors.reduce(
      (minMax, sector) => {
        const distanceToCamera = this.distanceToCamera(sector, modelMatrix);
        minMax.maxDistance = Math.max(minMax.maxDistance, distanceToCamera);
        minMax.minDistance = Math.min(minMax.minDistance, distanceToCamera);
        return minMax;
      },
      { minDistance: Infinity, maxDistance: -Infinity }
    );
    this._minSectorDistance = minDistance;
    this._maxSectorDistance = maxDistance;
  }

  computeTransformedSectorBounds(sectorBounds: THREE.Box3, modelMatrix: THREE.Matrix4, out: THREE.Box3): void {
    out.copy(sectorBounds);
    out.applyMatrix4(modelMatrix);
  }

  /**
   * Computes a weight in range [0-1], where 1 means close to camera and 0 means far away.
   */
  computeDistanceToCameraWeight(transformedSectorBounds: THREE.Box3): number {
    const minSectorDistance = this._minSectorDistance;
    const maxSectorDistance = this._maxSectorDistance;

    // Weight sectors that are close to the camera higher
    const distanceToCamera = transformedSectorBounds.distanceToPoint(this._camera.position);
    const normalizedDistanceToCamera = (distanceToCamera - minSectorDistance) / (maxSectorDistance - minSectorDistance);
    return 1.0 - normalizedDistanceToCamera;
  }

  /**
   * Compute a weight in range [0-1] where 1 means the sector covers the entire screen
   * and 0 means no coverage.
   * @param transformedSectorBounds
   * @returns
   */
  computeScreenAreaWeight(transformedSectorBounds: THREE.Box3): number {
    const distanceToCamera = transformedSectorBounds.distanceToPoint(this._camera.position);
    return distanceToCamera > 0.0 ? computeNdcAreaOfBox(this._camera, transformedSectorBounds) : 1.0;
  }

  /**
   * Compute a weight in range [0-1] based on at what "depths"
   * in the frustum the sector is placed.
   * @param transformedSectorBounds
   */
  computeFrustumDepthWeight(transformedSectorBounds: THREE.Box3): number {
    const frustumWeight = this._modifiedFrustums.reduce((accumulatedWeight, x) => {
      const { frustum, weight } = x;
      const accepted = frustum.intersectsBox(transformedSectorBounds);
      return accumulatedWeight + (accepted ? weight : 0);
    }, 0.0);
    return frustumWeight;
  }

  /**
   * Computes a weight based on placement in sector tree (i.e. prioritize)
   * sectors right below root sector.
   * @param sector
   */
  computeSectorTreePlacementWeight(sector: V9SectorMetadata): number {
    // Prioritize sectors directly under the root. These contains large structures
    // in V9 format and is therefore a low-detail version of the full model.
    return sector.depth === 1 ? 1.0 : 1.0 / 3.0;
  }

  /**
   * Computes a weight based on how large the biggest node within the sector
   * will be on screen (a number in range [0-1]).
   */
  computeMaximumNodeScreenSizeWeight(transformedSectorBounds: THREE.Box3, maxNodeDiagonalLength: number): number {
    const distanceToCamera = transformedSectorBounds.distanceToPoint(this._camera.position);
    if (distanceToCamera === 0.0) {
      return 1.0; // Can cover the whole screen regardless of how big the node is
    }

    // Create a line in the camera plane with the maximum diagonal length and compute
    // the size of this line on screen. Note that using camera distance is slightly wrong,
    // a better measurement is distance to screen but in practice this works well
    const p0 = this._camera
      .getWorldDirection(new THREE.Vector3())
      .multiplyScalar(distanceToCamera)
      .add(this._camera.position);
    const p1 = p0.clone().addScaledVector(this._camera.up, maxNodeDiagonalLength);

    // Project to NDC
    p0.project(this._camera);
    p1.project(this._camera);

    // Factor saying how much the biggest node covers on screen (1 means full view)
    const screenCoverage = p1.distanceToSquared(p0) / 4.0;

    // Scale coverage such that 5% screen estate is 1.0 weight
    const weight = Math.min(1.0, screenCoverage / 0.05);
    return weight;
  }

  /**
   * Returns a weight that is the maximum of the extra priority in intersecting prioritized areas.
   * @param transformedSectorBounds   Bounds of sectors in "Reveal coordinates".
   * @param prioritizedAreas          Zero or more areas with associated priorities.
   */
  computePrioritizedAreaWeight(transformedSectorBounds: THREE.Box3, prioritizedAreas: PrioritizedArea[]): number {
    const extraPriority = prioritizedAreas.reduce((maxExtraPriority, prioritizedArea) => {
      if (transformedSectorBounds.intersectsBox(prioritizedArea.area)) {
        return Math.max(prioritizedArea.extraPriority, maxExtraPriority);
      }
      return maxExtraPriority;
    }, 0.0);
    return extraPriority;
  }

  private distanceToCamera(sector: SectorMetadata, modelMatrix: THREE.Matrix4) {
    const { transformedBounds } = preallocated;
    transformedBounds.copy(sector.bounds);
    transformedBounds.applyMatrix4(modelMatrix);
    return transformedBounds.distanceToPoint(this._camera.position);
  }
}

function createModifiedProjectionMatrix(camera: THREE.PerspectiveCamera, near: number, far: number): THREE.Matrix4 {
  const modifiedCamera = camera.clone();
  modifiedCamera.near = near;
  modifiedCamera.far = far;
  modifiedCamera.updateProjectionMatrix();
  return modifiedCamera.projectionMatrix;
}
