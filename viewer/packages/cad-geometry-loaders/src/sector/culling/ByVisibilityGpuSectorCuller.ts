/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { OrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';
import { SectorCuller } from './SectorCuller';
import { DetermineSectorCostDelegate, DetermineSectorsInput, SectorCost, SectorLoadingSpent } from './types';
import { TakenV8SectorMap } from './takensectors';
import { CadModelBudget } from '../../CadModelBudget';

import { CadModelMetadata, WantedSector, LevelOfDetail, V8SectorMetadata } from '@reveal/cad-parsers';

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
  determineSectorCost?: DetermineSectorCostDelegate<V8SectorMetadata>;

  /**
   * Use a custom coverage utility to determine how "visible" each sector is.
   */
  coverageUtil: OrderSectorsByVisibilityCoverage;

  /**
   * Logging function for debugging.
   */
  logCallback?: (message?: any, ...optionalParameters: any[]) => void;
};

/**
 * SectorCuller that uses the GPU to determine an approximation
 * of how "visible" each sector is to get a priority for each sector
 * and loads sectors based on priority within a budget.
 */
export class ByVisibilityGpuSectorCuller implements SectorCuller {
  private readonly options: Required<ByVisibilityGpuSectorCullerOptions>;
  private readonly takenSectors: TakenV8SectorMap;

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
    this.takenSectors = new TakenV8SectorMap(this.options.determineSectorCost);
  }

  dispose(): void {
    this.options.coverageUtil.dispose();
  }

  determineSectors(input: DetermineSectorsInput): {
    wantedSectors: WantedSector[];
    spentBudget: SectorLoadingSpent;
  } {
    const takenSectors = this.update(input.camera, input.cadModelsMetadata, input.clippingPlanes, input.budget);
    const wanted = takenSectors.collectWantedSectors();
    const spentBudget = takenSectors.computeSpentBudget();

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
    budget: CadModelBudget
  ): TakenV8SectorMap {
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
        takenSectors.totalCost.renderCost
      }/${budget.maximumRenderCost}, priority: ${debugAccumulatedPriority})`
    );

    return takenSectors;
  }

  private addHighDetailsForNearSectors(
    camera: THREE.PerspectiveCamera,
    models: CadModelMetadata[],
    budget: CadModelBudget,
    takenSectors: TakenV8SectorMap,
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

      let intersectingSectors = model.scene
        .getSectorsIntersectingFrustum(cameraProjectionMatrix, transformedCameraMatrixWorldInverse)
        .map(p => p as V8SectorMetadata);

      if (clippingPlanes != null && clippingPlanes.length > 0) {
        intersectingSectors = this.testForClippingOcclusion(intersectingSectors, clippingPlanes, model.modelMatrix);
      }

      this.markSectorsAsDetailed(intersectingSectors, takenSectors, model);
    });
  }

  private testForClippingOcclusion(
    intersectingSectors: V8SectorMetadata[],
    clippingPlanes: THREE.Plane[],
    modelMatrix: THREE.Matrix4
  ): V8SectorMetadata[] {
    const passingSectors = [];
    const bounds = new THREE.Box3();
    for (let i = 0; i < intersectingSectors.length; i++) {
      bounds.copy(intersectingSectors[i].subtreeBoundingBox);
      bounds.applyMatrix4(modelMatrix);

      const shouldKeep = clippingPlanes.every(plane => isBox3OnPositiveSideOfPlane(bounds, plane));
      if (shouldKeep) {
        passingSectors.push(intersectingSectors[i]);
      }
    }
    return passingSectors;
  }

  private markSectorsAsDetailed(
    intersectingSectors: V8SectorMetadata[],
    takenSectors: TakenV8SectorMap,
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

function computeSectorCost(metadata: V8SectorMetadata, lod: LevelOfDetail): SectorCost {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return {
        downloadSize: metadata.indexFile!.downloadSize,
        drawCalls: metadata.estimatedDrawCallCount,
        renderCost: metadata.estimatedRenderCost
      };
    case LevelOfDetail.Simple:
      return {
        downloadSize: metadata.facesFile!.downloadSize,
        drawCalls: 1,
        // TODO 2021-09-23 larsmoa: Estimate for simple sector render cost is very arbitrary
        renderCost: Math.ceil(metadata.facesFile!.downloadSize / 100)
      };
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
