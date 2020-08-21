/*!
 * Copyright 2020 Cognite AS
 */

// Note! We introduce ThreeJS as a dependency here, but it's not exposed.
// If we add other rendering engines, we should consider to implement this in 'pure'
// WebGL.
import * as THREE from 'three';
import { mat4 } from 'gl-matrix';

import {
  GpuOrderSectorsByVisibilityCoverage,
  OrderSectorsByVisibilityCoverage
} from './OrderSectorsByVisibilityCoverage';
import { SectorCuller } from './SectorCuller';
import { TakenSectorTree } from './TakenSectorTree';
import { PrioritizedWantedSector, DetermineSectorCostDelegate, DetermineSectorsInput } from './types';
import { LevelOfDetail } from '../LevelOfDetail';
import { CadModelMetadata } from '../../CadModelMetadata';
import { SectorMetadata, WantedSector } from '../types';
import { fromThreeMatrix, toThreeVector3, ModelTransformation } from '@/utilities';

/**
 * Options for creating GpuBasedSectorCuller.
 */
export type ByVisibilityGpuSectorCullerOptions = {
  /**
   * Limit of how much data to load for a given view point. By default cost is measured in
   * downloaded bytes per sector.
   */
  costLimit?: number;

  /**
   * Optional callback for determining the cost of a sector. The default unit of the cost
   * function is bytes downloaded.
   */
  determineSectorCost?: DetermineSectorCostDelegate;

  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   */
  highDetailProximityThreshold?: number;

  /**
   * Use a custom coverage utility to determine how "visible" each sector is.
   */
  coverageUtil?: OrderSectorsByVisibilityCoverage;

  /**
   * Logging function for debugging.
   */
  logCallback?: (message?: any, ...optionalParameters: any[]) => void;
};

function assert(condition: boolean, message: string = 'assertion hit') {
  console.assert(condition, message);
}

class TakenSectorMap {
  get totalCost() {
    let totalCost = 0;
    this.maps.forEach(tree => {
      totalCost += tree.totalCost;
    });
    return totalCost;
  }
  private readonly maps: Map<CadModelMetadata, TakenSectorTree> = new Map();
  private readonly determineSectorCost: DetermineSectorCostDelegate;

  // TODO 2020-04-21 larsmoa: Unit test TakenSectorMap
  constructor(determineSectorCost: DetermineSectorCostDelegate) {
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(modelMetadata: CadModelMetadata) {
    this.maps.set(modelMetadata, new TakenSectorTree(modelMetadata.scene.root, this.determineSectorCost));
  }

  getWantedSectorCount(): number {
    let count = 0;
    this.maps.forEach(tree => {
      count += tree.determineWantedSectorCount();
    });
    return count;
  }

  markSectorDetailed(model: CadModelMetadata, sectorId: number, priority: number) {
    const tree = this.maps.get(model);
    assert(!!tree);
    tree!.markSectorDetailed(sectorId, priority);
  }

  collectWantedSectors(): PrioritizedWantedSector[] {
    // Count sectors to pre-allocate array of sectors
    // let sectorCount = 0;
    // for (const tree of this.maps.values()) {
    //   sectorCount += tree.determineWantedSectorCount();
    // }
    const allWanted = new Array<PrioritizedWantedSector>();

    // Collect sectors
    for (const entry of this.maps) {
      const model = entry[0];
      const tree = entry[1];
      allWanted.push(...tree.toWantedSectors(model));
    }

    // Sort by priority
    allWanted.sort((l, r) => r.priority - l.priority);
    return allWanted;
  }

  clear() {
    this.maps.clear();
  }
}

/**
 * SectorCuller that uses the GPU to determine an approximation
 * of how "visible" each sector is to get a priority for each sector
 * and loads sectors based on priority within a budget.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  public static readonly DefaultCostLimit = 50 * 1024 * 1024;
  public static readonly DefaultHighDetailProximityThreshold = 10;

  private readonly options: Required<ByVisibilityGpuSectorCullerOptions>;
  private readonly takenSectors: TakenSectorMap;

  constructor(options?: ByVisibilityGpuSectorCullerOptions) {
    this.options = {
      costLimit: options && options.costLimit ? options.costLimit : ByVisibilityGpuSectorCuller.DefaultCostLimit,
      determineSectorCost:
        options && options.determineSectorCost ? options.determineSectorCost : computeSectorCostAsDownloadSize,
      highDetailProximityThreshold:
        options && options.highDetailProximityThreshold
          ? options.highDetailProximityThreshold
          : ByVisibilityGpuSectorCuller.DefaultHighDetailProximityThreshold,
      logCallback:
        options && options.logCallback
          ? options.logCallback
          : // No logging
            () => {},

      coverageUtil: options && options.coverageUtil ? options.coverageUtil : new GpuOrderSectorsByVisibilityCoverage()
    };
    this.takenSectors = new TakenSectorMap(this.options.determineSectorCost);
  }

  determineSectors(input: DetermineSectorsInput): WantedSector[] {
    const takenSectors = this.update(
      input.camera,
      input.cadModelsMetadata,
      input.clippingPlanes,
      input.clipIntersection
    );
    const wanted = takenSectors.collectWantedSectors();

    const totalSectorCount = input.cadModelsMetadata.reduce((sum, x) => sum + x.scene.sectorCount, 0);
    const takenSectorCount = wanted.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded).length;
    const takenSimpleCount = wanted.filter(x => x.levelOfDetail === LevelOfDetail.Simple).length;
    const takenDetailedPercent = ((100.0 * (takenSectorCount - takenSimpleCount)) / totalSectorCount).toPrecision(3);
    const takenPercent = ((100.0 * takenSectorCount) / totalSectorCount).toPrecision(3);

    this.log(
      `Scene: ${wanted.length} (${
        wanted.filter(x => !Number.isFinite(x.priority)).length
      } required, ${totalSectorCount} sectors, ${takenPercent}% of all sectors - ${takenDetailedPercent}% detailed)`
    );
    return wanted;
  }

  get lastWantedSectors(): PrioritizedWantedSector[] {
    return this.takenSectors.collectWantedSectors();
  }

  private update(
    camera: THREE.PerspectiveCamera,
    models: CadModelMetadata[],
    clippingPlanes: THREE.Plane[] | null,
    clipIntersection: boolean
  ): TakenSectorMap {
    const { coverageUtil } = this.options;
    const takenSectors = this.takenSectors;
    takenSectors.clear();
    models.forEach(x => takenSectors.initializeScene(x));

    // Update wanted sectors
    coverageUtil.setModels(models);
    coverageUtil.setClipping(clippingPlanes, clipIntersection);
    const prioritized = coverageUtil.orderSectorsByVisibility(camera);
    const costLimit = this.options.costLimit;

    // Add high details for all sectors the camera is inside or near
    const proximityThreshold = this.options.highDetailProximityThreshold;
    this.addHighDetailsForNearSectors(
      camera,
      models,
      proximityThreshold,
      takenSectors,
      clippingPlanes,
      clipIntersection
    );

    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;

    let i = 0;
    for (i = 0; i < prioritizedLength && takenSectors.totalCost < costLimit; i++) {
      const x = prioritized[i];
      takenSectors.markSectorDetailed(x.model, x.sectorId, x.priority);
      debugAccumulatedPriority += x.priority;
    }

    this.log(`Retrieving ${i} of ${prioritizedLength} (last: ${prioritized.length > 0 ? prioritized[i - 1] : null})`);
    this.log(
      `Total scheduled: ${takenSectors.getWantedSectorCount()} of ${prioritizedLength} (cost: ${
        takenSectors.totalCost / 1024 / 1024
      }/${costLimit / 1024 / 1024}, priority: ${debugAccumulatedPriority})`
    );

    return takenSectors;
  }

  private addHighDetailsForNearSectors(
    camera: THREE.PerspectiveCamera,
    models: CadModelMetadata[],
    proximityThreshold: number,
    takenSectors: TakenSectorMap,
    clippingPlanes: THREE.Plane[] | null,
    clipIntersection: boolean
  ) {
    const shortRangeCamera = camera.clone(true);
    shortRangeCamera.far = proximityThreshold;
    shortRangeCamera.updateProjectionMatrix();
    const cameraMatrixWorldInverse = fromThreeMatrix(mat4.create(), shortRangeCamera.matrixWorldInverse);
    const cameraProjectionMatrix = fromThreeMatrix(mat4.create(), shortRangeCamera.projectionMatrix);

    const transformedCameraMatrixWorldInverse = mat4.create();
    models.forEach(model => {
      // Apply model transformation to camera matrix
      mat4.multiply(
        transformedCameraMatrixWorldInverse,
        cameraMatrixWorldInverse,
        model.modelTransformation.modelMatrix
      );

      let intersectingSectors = model.scene.getSectorsIntersectingFrustum(
        cameraProjectionMatrix,
        transformedCameraMatrixWorldInverse
      );

      if (clippingPlanes != null && clippingPlanes.length > 0) {
        intersectingSectors = this.testForClippingOcclusion(
          intersectingSectors,
          clippingPlanes,
          model.modelTransformation,
          clipIntersection
        );
      }

      this.markSectorsAsDetailed(intersectingSectors, takenSectors, model);
    });
  }

  private testForClippingOcclusion(
    intersectingSectors: SectorMetadata[],
    clippingPlanes: THREE.Plane[],
    modelTransform: ModelTransformation,
    clipIntersection: boolean
  ): SectorMetadata[] {
    const passingSectors = [];

    for (let i = 0; i < intersectingSectors.length; i++) {
      const boundPoints = intersectingSectors[i].bounds.getCornerPoints().map(p => {
        const outvec = new THREE.Vector3();

        toThreeVector3(outvec, p, modelTransform);

        return outvec;
      });

      let shouldKeep = !clipIntersection;
      for (let k = 0; k < clippingPlanes.length; k++) {
        let planeAccepts = false;

        for (let j = 0; j < boundPoints.length; j++) {
          planeAccepts = clippingPlanes[k].distanceToPoint(boundPoints[j]) >= 0 || planeAccepts;
        }

        if (clipIntersection) {
          shouldKeep = shouldKeep || planeAccepts;
        } else {
          shouldKeep = shouldKeep && planeAccepts;
        }
      }

      if (shouldKeep) {
        passingSectors.push(intersectingSectors[i]);
      }
    }
    return passingSectors;
  }

  private markSectorsAsDetailed(
    intersectingSectors: SectorMetadata[],
    takenSectors: TakenSectorMap,
    model: CadModelMetadata
  ) {
    for (let i = 0; i < intersectingSectors.length; i++) {
      takenSectors.markSectorDetailed(model, intersectingSectors[i].id, Infinity);
    }
  }

  private log(message?: any, ...optionalParameters: any[]) {
    this.options.logCallback(message, ...optionalParameters);
  }
}

function computeSectorCostAsDownloadSize(metadata: SectorMetadata, lod: LevelOfDetail): number {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return metadata.indexFile.downloadSize;
    case LevelOfDetail.Simple:
      return metadata.facesFile.downloadSize;
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
