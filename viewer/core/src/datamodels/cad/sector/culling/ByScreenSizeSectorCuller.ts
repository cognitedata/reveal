/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadModelMetadata, SectorCuller } from '../../../../internals';
import { WantedSector } from '../types';
import {
  DetermineSectorCostDelegate,
  DetermineSectorsInput,
  PrioritizedWantedSector,
  SectorCost,
  SectorLoadingSpent
} from './types';
import { computeSectorCost } from './computeSectorCost';
import { computeNdcAreaOfBox } from './computeNdcAreaOfBox';
import assert from 'assert';
import { LevelOfDetail } from '../LevelOfDetail';
import { CadModelSectorBudget } from '../../CadModelSectorBudget';
import { traverseDepthFirst } from '../../../../utilities';

export type ByScreenSizeSectorCullerOptions = {
  /**
   * Optional callback for determining the cost of a sector. The default unit of the cost
   * function is bytes downloaded.
   */
  determineSectorCost?: DetermineSectorCostDelegate;
};

export class ByScreenSizeSectorCuller implements SectorCuller {
  private readonly _determineSectorCost: DetermineSectorCostDelegate;

  constructor(options?: ByScreenSizeSectorCullerOptions) {
    this._determineSectorCost = options?.determineSectorCost || computeSectorCost;
  }

  determineSectors(input: DetermineSectorsInput): {
    wantedSectors: WantedSector[];
    spentBudget: SectorLoadingSpent;
  } {
    if (input.clippingPlanes !== null && input.clippingPlanes.length > 0) {
      throw new Error('Clipping planes not supported');
    }
    const takenSectors = new ScheduledSectorTree(this._determineSectorCost);

    const { cadModelsMetadata, camera } = input;
    const cameraMatrixWorldInverse = camera.matrixWorldInverse;
    const cameraProjectionMatrix = camera.projectionMatrix;

    const transformedCameraMatrixWorldInverse = new THREE.Matrix4();
    const transformedBounds = new THREE.Box3();
    const candidateSectors = new Array<{
      model: CadModelMetadata;
      sectorId: number;
      priority: number;
      debugStuff: any;
    }>();
    cadModelsMetadata.map(model => {
      takenSectors.initializeScene(model);
      transformedCameraMatrixWorldInverse.multiplyMatrices(cameraMatrixWorldInverse, model.modelMatrix);

      const sectors = model.scene.getSectorsIntersectingFrustum(
        cameraProjectionMatrix,
        transformedCameraMatrixWorldInverse
      );

      const { minDistance: minSectorDistance, maxDistance: maxSectorDistance } = sectors.reduce(
        (minMax, sector) => {
          transformedBounds.copy(sector.bounds);
          transformedBounds.applyMatrix4(model.modelMatrix);
          const distanceToCamera = transformedBounds.distanceToPoint(camera.position);
          minMax.maxDistance = Math.max(minMax.maxDistance, distanceToCamera);
          minMax.minDistance = Math.min(minMax.minDistance, distanceToCamera);
          return minMax;
        },
        { minDistance: Infinity, maxDistance: -Infinity }
      );

      sectors.forEach(sector => {
        transformedBounds.copy(sector.bounds);
        transformedBounds.applyMatrix4(model.modelMatrix);

        const screenArea = computeNdcAreaOfBox(camera, transformedBounds);
        // Weight sectors that are close to the camera higher
        const distanceToCamera = transformedBounds.distanceToPoint(camera.position);
        const normalizedDistanceToCamera =
          (distanceToCamera - minSectorDistance) / (maxSectorDistance - minSectorDistance);
        // const priority = screenArea / Math.log2(2.0 + transformedBounds.distanceToPoint(camera.position));
        const screenAreaWeight = 0.6;
        const distanceToCameraWeight = 1.0 - screenAreaWeight;
        const priority = screenAreaWeight * screenArea + distanceToCameraWeight * (1.0 - normalizedDistanceToCamera);

        candidateSectors.push({
          model,
          sectorId: sector.id,
          priority,
          debugStuff: {
            screenArea,
            distanceToCamera,
            normalizedDistanceToCamera,
            camera: camera.clone(),
            transformedBounds: transformedBounds.clone()
          }
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

    console.log('Scheduled', takenSectorCount, 'of', candidateSectors.length, 'candidates');

    const wanted = takenSectors.collectWantedSectors();
    const spentBudget = takenSectors.computeSpentBudget();

    console.log(
      'Scheduled sectors',
      candidateSectors.slice(0, takenSectorCount).map(x => ({ id: x.sectorId, screenArea: x.priority })),
      'Candidates:',
      candidateSectors.slice().sort((left, right) => left.sectorId - right.sectorId)
    );
    console.log('Budget:', { ...input.budget }, 'Spent:', { ...spentBudget });

    return { spentBudget, wantedSectors: wanted };
  }

  filterSectorsToLoad(_input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]> {
    return Promise.resolve(wantedSectorsBatch);
  }

  dispose(): void {}
}

class ScheduledSectorTree {
  private readonly determineSectorCost: DetermineSectorCostDelegate;
  private readonly _totalCost: SectorCost = { downloadSize: 0, drawCalls: 0 };
  private readonly _models = new Map<string, { model: CadModelMetadata; sectorIds: Map<number, number> }>();

  get totalCost(): SectorCost {
    return { ...this._totalCost };
  }

  constructor(determineSectorCost: DetermineSectorCostDelegate) {
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

    const allSectors = model.scene.getAllSectors();
    const { sectorIds } = entry!;
    let nextSectorIdToAdd = sectorId;
    if (nextSectorIdToAdd !== -1 && !sectorIds.has(nextSectorIdToAdd)) {
      const existingPriority = sectorIds.get(nextSectorIdToAdd);
      if (existingPriority === undefined) {
        const sectorMetadata = model.scene.getSectorById(sectorId);
        assert(sectorMetadata !== undefined);

        const sectorCost = this.determineSectorCost(sectorMetadata!, LevelOfDetail.Detailed);
        this._totalCost.downloadSize += sectorCost.downloadSize;
        this._totalCost.drawCalls += sectorCost.drawCalls;

        sectorIds.set(nextSectorIdToAdd, priority);
      } else {
        sectorIds.set(nextSectorIdToAdd, Math.max(priority, existingPriority));
      }
      const parent = allSectors.find(x => x.children.findIndex(x => x.id === nextSectorIdToAdd));
      nextSectorIdToAdd = parent !== undefined ? parent.id : -1;
    }
  }

  isWithinBudget(budget: CadModelSectorBudget): boolean {
    return (
      this._totalCost.downloadSize < budget.geometryDownloadSizeBytes &&
      this._totalCost.drawCalls < budget.maximumNumberOfDrawCalls
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

    // Sort by priority
    allWanted.sort((l, r) => r.priority - l.priority);
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
