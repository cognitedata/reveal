/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata, CadModelMetadata, WantedSector, LevelOfDetail } from '@reveal/cad-parsers';

import { OrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';
import { SectorCuller } from './SectorCuller';
import { DetermineSectorCostDelegate, DetermineSectorsInput, SectorCost, SectorLoadingSpent } from './types';

import { CadModelSectorBudget } from '../../CadModelSectorBudget';
import { TakenSectorMap } from './TakenSectorMap';
import { isBox3OnPositiveSideOfPlane } from '@reveal/utilities';

/**
 * Options for creating {@link ByVisibilityGpuSectorCuller}.
 */
export type ByVisibilityGpuSectorCullerOptions = {
  /**
   * Renderer used to determine what sector to load.
   */
  renderer: THREE.WebGLRenderer;

  /**
   * Optional callback for determining the cost of a sector. The default unit of the cost
   * function is bytes downloaded.
   */
  determineSectorCost?: DetermineSectorCostDelegate;

  /**
   * Use a custom coverage utility to determine how "visible" each sector is.
   */
  coverageUtil: OrderSectorsByVisibilityCoverage;

  /**
   * Logging function for debugging.
   */
  logCallback?: (message?: any, ...optionalParameters: any[]) => void;
};

export function assert(condition: boolean, message: string = 'assertion hit') {
  console.assert(condition, message);
}

/**
 * SectorCuller that uses the GPU to determine an approximation
 * of how "visible" each sector is to get a priority for each sector
 * and loads sectors based on priority within a budget.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  private readonly options: Required<ByVisibilityGpuSectorCullerOptions>;
  private readonly takenSectors: TakenSectorMap;

  constructor(options: ByVisibilityGpuSectorCullerOptions) {
    this.options = {
      renderer: options.renderer,
      determineSectorCost: options && options.determineSectorCost ? options.determineSectorCost : computeSectorCost,
      logCallback:
        options && options.logCallback
          ? options.logCallback
          : // No logging
            () => {},
      coverageUtil: options.coverageUtil
    };
    this.takenSectors = new TakenSectorMap(this.options.determineSectorCost);
  }

  dispose() {
    this.options.coverageUtil.dispose();
  }

  determineSectors(input: DetermineSectorsInput): { wantedSectors: WantedSector[]; spentBudget: SectorLoadingSpent } {
    const takenSectors = this.update(input.camera, input.cadModelsMetadata, input.clippingPlanes, input.budget);
    const wanted = takenSectors.collectWantedSectors();
    const spentBudget = takenSectors.computeSpentBudget();

    const takenDetailedPercent = (
      (100.0 * (spentBudget.loadedSectorCount - spentBudget.loadedSectorCount)) /
      spentBudget.totalSectorCount
    ).toPrecision(3);
    const takenPercent = ((100.0 * spentBudget.loadedSectorCount) / spentBudget.totalSectorCount).toPrecision(3);

    this.log(
      `Scene: ${spentBudget.loadedSectorCount} (${spentBudget.forcedDetailedSectorCount} required, ${spentBudget.totalSectorCount} sectors, ${takenPercent}% of all sectors - ${takenDetailedPercent}% detailed)`
    );

    return { spentBudget, wantedSectors: wanted };
  }

  filterSectorsToLoad(input: DetermineSectorsInput, wantedSectors: WantedSector[]): Promise<WantedSector[]> {
    const filtered = this.options.coverageUtil.cullOccludedSectors(input.camera, wantedSectors);
    return Promise.resolve(filtered);
  }

  private update(
    camera: THREE.PerspectiveCamera,
    models: CadModelMetadata[],
    clippingPlanes: THREE.Plane[] | null,
    budget: CadModelSectorBudget
  ): TakenSectorMap {
    const { coverageUtil } = this.options;
    const takenSectors = this.takenSectors;
    takenSectors.clear();
    models.forEach(x => takenSectors.initializeScene(x));

    // Update wanted sectors
    coverageUtil.setModels(models);
    coverageUtil.setClipping(clippingPlanes);
    const prioritized = coverageUtil.orderSectorsByVisibility(camera);

    // Add high details for all sectors the camera is inside or near
    this.addHighDetailsForNearSectors(camera, models, budget, takenSectors, clippingPlanes);

    let debugAccumulatedPriority = 0.0;
    const prioritizedLength = prioritized.length;

    let i = 0;
    for (i = 0; i < prioritizedLength && takenSectors.isWithinBudget(budget); i++) {
      const x = prioritized[i];
      takenSectors.markSectorDetailed(x.model, x.sectorId, x.priority);
      debugAccumulatedPriority += x.priority;
    }

    this.log(`Retrieving ${i} of ${prioritizedLength} (last: ${prioritized.length > 0 ? prioritized[i - 1] : null})`);
    this.log(
      `Total scheduled: ${takenSectors.getWantedSectorCount()} of ${prioritizedLength} (cost: ${
        takenSectors.totalCost.downloadSize / 1024 / 1024
      }/${budget.geometryDownloadSizeBytes / 1024 / 1024}, drawCalls: ${takenSectors.totalCost.drawCalls}/${
        budget.maximumNumberOfDrawCalls
      }, priority: ${debugAccumulatedPriority})`
    );

    return takenSectors;
  }

  private addHighDetailsForNearSectors(
    camera: THREE.PerspectiveCamera,
    models: CadModelMetadata[],
    budget: CadModelSectorBudget,
    takenSectors: TakenSectorMap,
    clippingPlanes: THREE.Plane[] | null
  ) {
    const shortRangeCamera = camera.clone(true) as THREE.PerspectiveCamera;
    shortRangeCamera.far = budget.highDetailProximityThreshold;
    shortRangeCamera.updateProjectionMatrix();
    const cameraMatrixWorldInverse = shortRangeCamera.matrixWorldInverse;
    const cameraProjectionMatrix = shortRangeCamera.projectionMatrix;

    const transformedCameraMatrixWorldInverse = new THREE.Matrix4();
    models.forEach(model => {
      // Apply model transformation to camera matrix
      transformedCameraMatrixWorldInverse.multiplyMatrices(cameraMatrixWorldInverse, model.modelMatrix);

      let intersectingSectors = model.scene.getSectorsIntersectingFrustum(
        cameraProjectionMatrix,
        transformedCameraMatrixWorldInverse
      );

      if (clippingPlanes != null && clippingPlanes.length > 0) {
        intersectingSectors = this.testForClippingOcclusion(intersectingSectors, clippingPlanes, model.modelMatrix);
      }

      this.markSectorsAsDetailed(intersectingSectors, takenSectors, model);
    });
  }

  private testForClippingOcclusion(
    intersectingSectors: SectorMetadata[],
    clippingPlanes: THREE.Plane[],
    modelMatrix: THREE.Matrix4
  ): SectorMetadata[] {
    const passingSectors = [];
    const bounds = new THREE.Box3();
    for (let i = 0; i < intersectingSectors.length; i++) {
      bounds.copy(intersectingSectors[i].bounds);
      bounds.applyMatrix4(modelMatrix);

      const shouldKeep = clippingPlanes.every(plane => isBox3OnPositiveSideOfPlane(bounds, plane));
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
function computeSectorCost(metadata: SectorMetadata, lod: LevelOfDetail): SectorCost {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return {
        downloadSize: metadata.indexFile.downloadSize,
        drawCalls: metadata.estimatedDrawCallCount,
        renderCost: metadata.estimatedRenderCost
      };
    case LevelOfDetail.Simple:
      return {
        downloadSize: metadata.facesFile.downloadSize,
        drawCalls: 1,
        // TODO 2021-09-23 larsmoa: Estimate for simple sector render cost is very arbitrary
        renderCost: Math.ceil(metadata.facesFile.downloadSize / 100)
      };
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
