/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadModelMetadata, SectorCuller } from '../../../../internals';
import { WantedSector } from '../types';
import { TakenSectorMap } from './TakenSectorMap';
import { DetermineSectorCostDelegate, DetermineSectorsInput, SectorLoadingSpent } from './types';
import { computeSectorCost } from './computeSectorCost';
import { computeNdcAreaOfBox } from './computeNdcAreaOfBox';

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
      throw new Error('');
    }
    const takenSectors = new TakenSectorMap(this._determineSectorCost);

    const { cadModelsMetadata, camera } = input;
    const cameraMatrixWorldInverse = camera.matrixWorldInverse;
    const cameraProjectionMatrix = camera.projectionMatrix;

    const transformedCameraMatrixWorldInverse = new THREE.Matrix4();
    const transformedBounds = new THREE.Box3();
    const candidateSectors = new Array<{ model: CadModelMetadata; sectorId: number; priority: number }>();
    cadModelsMetadata.map(model => {
      takenSectors.initializeScene(model);
      transformedCameraMatrixWorldInverse.multiplyMatrices(cameraMatrixWorldInverse, model.modelMatrix);

      const sectors = model.scene.getSectorsIntersectingFrustum(
        cameraProjectionMatrix,
        transformedCameraMatrixWorldInverse
      );

      sectors.forEach(sector => {
        transformedBounds.copy(sector.bounds);
        transformedBounds.applyMatrix4(model.modelMatrix);

        const screenArea = computeNdcAreaOfBox(camera, transformedBounds);
        // Weight sectors that are close to the camera higher
        const priority = screenArea / Math.log2(2.0 + transformedBounds.distanceToPoint(camera.position));

        candidateSectors.push({ model, sectorId: sector.id, priority });
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
      candidateSectors.slice(0, takenSectorCount).map(x => ({ id: x.sectorId, screenArea: x.priority }))
    );
    console.log({ ...spentBudget });

    return { spentBudget, wantedSectors: wanted };
  }

  filterSectorsToLoad(_input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]> {
    return Promise.resolve(wantedSectorsBatch);
  }

  dispose(): void {}
}
