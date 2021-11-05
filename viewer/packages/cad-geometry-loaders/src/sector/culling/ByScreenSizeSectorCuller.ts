/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import {
  addSectorCost,
  DetermineSectorCostDelegate,
  DetermineSectorsInput,
  PrioritizedWantedSector,
  SectorCost,
  SectorLoadingSpent
} from './types';
import { CadModelSectorBudget } from '../../CadModelSectorBudget';
import { WeightFunctionsHelper } from './WeightFunctionsHelper';
import { SectorCuller } from './SectorCuller';

import Log from '@reveal/logger';
import { CadModelMetadata, V9SectorMetadata, LevelOfDetail, SectorScene, WantedSector } from '@reveal/cad-parsers';
import { isBox3OnPositiveSideOfPlane, traverseDepthFirst } from '@reveal/utilities';

import assert from 'assert';
import { computeV9SectorCost } from './computeSectorCost';

export type ByScreenSizeSectorCullerOptions = {
  /**
   * Optional callback for determining the cost of a sector. The default unit of the cost
   * function is bytes downloaded.
   */
  determineSectorCost?: DetermineSectorCostDelegate<V9SectorMetadata>;
};

export class ByScreenSizeSectorCuller implements SectorCuller {
  private readonly _determineSectorCost: DetermineSectorCostDelegate<V9SectorMetadata>;

  constructor(options?: ByScreenSizeSectorCullerOptions) {
    this._determineSectorCost = options?.determineSectorCost || computeV9SectorCost;
  }

  determineSectors(input: DetermineSectorsInput): {
    wantedSectors: WantedSector[];
    spentBudget: SectorLoadingSpent;
  } {
    const takenSectors = new ScheduledSectorTree(this._determineSectorCost);

    const { cadModelsMetadata, camera } = input;
    const cameraWorldInverseMatrix = camera.matrixWorldInverse;
    const cameraProjectionMatrix = camera.projectionMatrix;

    const weightFunctions = new WeightFunctionsHelper(camera);

    const transformedBounds = new THREE.Box3();
    const candidateSectors = new Array<{
      model: CadModelMetadata;
      sectorId: number;
      priority: number;
    }>();

    cadModelsMetadata.map(model => {
      takenSectors.initializeScene(model);

      const sectors = determineCandidateSectors(
        cameraWorldInverseMatrix,
        cameraProjectionMatrix,
        model.modelMatrix,
        model.scene,
        input.clippingPlanes
      );

      weightFunctions.addCandidateSectors(sectors, model.modelMatrix);
    });

    cadModelsMetadata.map(model => {
      const sectors = determineCandidateSectors(
        cameraWorldInverseMatrix,
        cameraProjectionMatrix,
        model.modelMatrix,
        model.scene,
        input.clippingPlanes
      );

      sectors.forEach(sectorMetadata => {
        const sector = sectorMetadata as V9SectorMetadata;
        weightFunctions.computeTransformedSectorBounds(sector.bounds, model.modelMatrix, transformedBounds);

        const levelWeightImportance = 2.0;
        const distanceToImportance = 1.0;
        const screenAreaImportance = 0.3;
        const frustumDepthImportance = 0.2;
        const nodeScreenSizeImportance = 1.0;

        const levelWeight = weightFunctions.computeSectorTreePlacementWeight(sector);
        const distanceToCameraWeight = weightFunctions.computeDistanceToCameraWeight(transformedBounds);
        const screenAreaWeight = weightFunctions.computeScreenAreaWeight(transformedBounds);
        const frustumDepthWeight = weightFunctions.computeFrustumDepthWeight(transformedBounds);
        const nodeScreenSizeWeight =
          sector.maxDiagonalLength !== undefined
            ? weightFunctions.computeMaximumNodeScreenSizeWeight(transformedBounds, sector.maxDiagonalLength)
            : 1.0;

        const priority =
          levelWeightImportance * levelWeight +
          distanceToImportance * distanceToCameraWeight +
          screenAreaImportance * screenAreaWeight +
          frustumDepthImportance * frustumDepthWeight +
          nodeScreenSizeImportance * nodeScreenSizeWeight;

        candidateSectors.push({
          model,
          sectorId: sector.id,
          priority
        });
      });
    });
    candidateSectors.sort((left, right) => {
      return right.priority - left.priority;
    });

    let takenSectorCount = 0;
    for (let i = 0; takenSectors.isWithinBudget(input.budget) && i < candidateSectors.length; ++i) {
      const { model, sectorId, priority } = candidateSectors[i];
      takenSectors.markSectorDetailed(model, sectorId, priority);
      takenSectorCount = i;
    }

    Log.debug('Scheduled', takenSectorCount, 'of', candidateSectors.length, 'candidates');

    const wanted = takenSectors.collectWantedSectors();
    const spentBudget = takenSectors.computeSpentBudget();

    const takenPriorities = candidateSectors
      .slice(0, takenSectorCount)
      .map(x => x.priority)
      .sort((a, b) => a - b);
    const meanPriority = takenPriorities[Math.floor(takenPriorities.length / 2)];
    const notAcceptedPriority =
      candidateSectors.length > takenSectorCount ? candidateSectors[takenSectorCount].priority : -1;
    Log.debug(
      `Sector priority. Min: ${Math.min(...takenPriorities)}, max: ${Math.max(
        ...takenPriorities
      )}, mean: ${meanPriority}, first not accepted: ${notAcceptedPriority}`
    );
    Log.debug('Budget:', { ...input.budget });
    Log.debug('Spent:', { ...spentBudget });
    return { spentBudget, wantedSectors: wanted };
  }

  filterSectorsToLoad(_input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]> {
    // TODO 2021-09-27 larsmoa: Implement pre-load occlusion culling in ByScreenSizeSectorCuller
    return Promise.resolve(wantedSectorsBatch);
  }

  dispose(): void {}
}

class ScheduledSectorTree {
  private readonly determineSectorCost: DetermineSectorCostDelegate<V9SectorMetadata>;
  private readonly _totalCost: SectorCost = { downloadSize: 0, drawCalls: 0, renderCost: 0 };
  private readonly _models = new Map<string, { model: CadModelMetadata; sectorIds: Map<number, number> }>();

  get totalCost(): SectorCost {
    return { ...this._totalCost };
  }

  constructor(determineSectorCost: DetermineSectorCostDelegate<V9SectorMetadata>) {
    this.determineSectorCost = determineSectorCost;
  }

  initializeScene(modelMetadata: CadModelMetadata) {
    this._models.set(modelMetadata.modelIdentifier, { model: modelMetadata, sectorIds: new Map<number, number>() });
  }

  getWantedSectorCount(): number {
    let count = 0;
    this._models.forEach(x => {
      count += x.sectorIds.size;
    });
    return count;
  }

  markSectorDetailed(model: CadModelMetadata, sectorId: number, priority: number) {
    const entry = this._models.get(model.modelIdentifier);
    assert(!!entry, `Could not find sector tree for ${model.modelIdentifier}`);

    const { sectorIds } = entry!;
    const existingPriority = sectorIds.get(sectorId);
    if (existingPriority === undefined) {
      const sectorMetadata = model.scene.getSectorById(sectorId);
      assert(sectorMetadata !== undefined);

      const sectorCost = this.determineSectorCost(sectorMetadata! as V9SectorMetadata, LevelOfDetail.Detailed);
      addSectorCost(this._totalCost, sectorCost);

      sectorIds.set(sectorId, priority);
    } else {
      sectorIds.set(sectorId, Math.max(priority, existingPriority));
    }
  }

  isWithinBudget(budget: CadModelSectorBudget): boolean {
    return (
      this._totalCost.downloadSize < budget.geometryDownloadSizeBytes &&
      this._totalCost.drawCalls < budget.maximumNumberOfDrawCalls &&
      this._totalCost.renderCost < budget.maximumRenderCost
    );
  }

  collectWantedSectors(): PrioritizedWantedSector[] {
    const allWanted = new Array<PrioritizedWantedSector>();

    // Collect sectors
    for (const [modelIdentifier, sectorsContainer] of this._models) {
      const { model, sectorIds } = sectorsContainer;

      const allSectorsInModel = new Map<number, PrioritizedWantedSector>();
      traverseDepthFirst(model.scene.root, sector => {
        allSectorsInModel.set(sector.id, {
          modelIdentifier,
          modelBaseUrl: model.modelBaseUrl,
          geometryClipBox: null,
          levelOfDetail: LevelOfDetail.Discarded,
          metadata: sector,
          priority: -1
        });
        return true;
      });
      for (const [sectorId, priority] of sectorIds) {
        const sector = model.scene.getSectorById(sectorId)!;
        const wantedSector: PrioritizedWantedSector = {
          modelIdentifier,
          modelBaseUrl: model.modelBaseUrl,
          geometryClipBox: null,
          levelOfDetail: LevelOfDetail.Detailed,
          metadata: sector,
          priority
        };
        allSectorsInModel.set(sectorId, wantedSector);
      }

      allSectorsInModel.forEach(x => allWanted.push(x));
    }

    // Sort by state (discarded comes first), then priority
    allWanted.sort((l, r) => {
      if (l.levelOfDetail === LevelOfDetail.Discarded) {
        return -1;
      } else if (r.levelOfDetail === LevelOfDetail.Discarded) {
        return 1;
      }
      return r.priority - l.priority;
    });
    return allWanted;
  }

  computeSpentBudget(): SectorLoadingSpent {
    const wanted = this.collectWantedSectors();
    const models = Array.from(this._models.values()).map(x => x.model);
    const nonDiscarded = wanted.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    const totalSectorCount = models.reduce((sum, x) => sum + x.scene.sectorCount, 0);
    const takenSectorCount = nonDiscarded.length;
    const takenSimpleCount = nonDiscarded.filter(x => x.levelOfDetail === LevelOfDetail.Simple).length;
    const forcedDetailedSectorCount = nonDiscarded.filter(x => !Number.isFinite(x.priority)).length;
    const accumulatedPriority = nonDiscarded
      .filter(x => Number.isFinite(x.priority) && x.priority > 0)
      .reduce((sum, x) => sum + x.priority, 0);

    const spentBudget: SectorLoadingSpent = {
      drawCalls: this.totalCost.drawCalls,
      downloadSize: this.totalCost.downloadSize,
      renderCost: this.totalCost.renderCost,
      totalSectorCount,
      forcedDetailedSectorCount,
      loadedSectorCount: takenSectorCount,
      simpleSectorCount: takenSimpleCount,
      detailedSectorCount: takenSectorCount - takenSimpleCount,
      accumulatedPriority
    };

    return spentBudget;
  }

  clear() {
    this._models.clear();
  }
}

function determineCandidateSectors(
  cameraWorldInverseMatrix: THREE.Matrix4,
  cameraProjectionMatrix: THREE.Matrix4,
  modelMatrix: THREE.Matrix4,
  modelScene: SectorScene,
  clippingPlanes: THREE.Plane[]
) {
  const transformedCameraMatrixWorldInverse = new THREE.Matrix4();
  transformedCameraMatrixWorldInverse.multiplyMatrices(cameraWorldInverseMatrix, modelMatrix);
  const sectors = modelScene.getSectorsIntersectingFrustum(cameraProjectionMatrix, transformedCameraMatrixWorldInverse);

  if (clippingPlanes.length > 0) {
    const bounds = new THREE.Box3();
    return sectors.filter(sector => {
      bounds.copy(sector.bounds);
      bounds.applyMatrix4(modelMatrix);

      const shouldKeep = clippingPlanes.every(plane => isBox3OnPositiveSideOfPlane(bounds, plane));
      return shouldKeep;
    });
  }
  return sectors;
}
