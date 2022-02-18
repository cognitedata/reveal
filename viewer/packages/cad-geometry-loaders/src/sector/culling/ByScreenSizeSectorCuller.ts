/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { DetermineSectorCostDelegate, DetermineSectorsInput, SectorLoadingSpent } from './types';
import { WeightFunctionsHelper } from './WeightFunctionsHelper';
import { SectorCuller } from './SectorCuller';
import { computeV9SectorCost } from './computeSectorCost';
import { TakenV9SectorMap } from './takensectors';

import Log from '@reveal/logger';
import { CadModelMetadata, V9SectorMetadata, SectorScene, WantedSector } from '@reveal/cad-parsers';
import { isBox3OnPositiveSideOfPlane } from '@reveal/utilities';
import { PrioritizedArea } from '@reveal/cad-styling';

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
    const takenSectors = new TakenV9SectorMap(this._determineSectorCost);
    const { cadModelsMetadata, camera } = input;
    const cameraWorldInverseMatrix = camera.matrixWorldInverse;
    const cameraProjectionMatrix = camera.projectionMatrix;
    const weightFunctions = new WeightFunctionsHelper(camera);

    // Determine potential candidates per model
    const modelsAndCandidateSectors = determineCandidateSectorsByModel(
      cadModelsMetadata,
      cameraWorldInverseMatrix,
      cameraProjectionMatrix,
      input
    );

    // Setup helpers we need
    initializeTakenSectorsAndWeightFunctions(modelsAndCandidateSectors, takenSectors, weightFunctions);

    // Determine priorities of each candidate sector
    const prioritizedSectors = sortSectorsByPriority(
      modelsAndCandidateSectors,
      weightFunctions,
      input.prioritizedAreas
    );
    const takenSectorCount = takeSectorsWithinBudget(takenSectors, input, prioritizedSectors);
    Log.debug('Scheduled', takenSectorCount, 'of', prioritizedSectors.length, 'candidates');

    const wanted = takenSectors.collectWantedSectors();
    const spentBudget = takenSectors.computeSpentBudget();
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

function takeSectorsWithinBudget(
  takenSectors: TakenV9SectorMap,
  input: DetermineSectorsInput,
  candidateSectors: { model: CadModelMetadata; sectorId: number; priority: number }[]
) {
  let takenSectorCount = 0;
  for (let i = 0; takenSectors.isWithinBudget(input.budget) && i < candidateSectors.length; ++i) {
    const { model, sectorId, priority } = candidateSectors[i];
    takenSectors.markSectorDetailed(model, sectorId, priority);
    takenSectorCount = i;
  }
  return takenSectorCount;
}

const _sortSectorsByPriorityVars = {
  transformedBounds: new THREE.Box3()
};

function sortSectorsByPriority(
  modelsAndCandidateSectors: Map<CadModelMetadata, V9SectorMetadata[]>,
  weightFunctions: WeightFunctionsHelper,
  prioritizedAreas: PrioritizedArea[]
): { model: CadModelMetadata; sectorId: number; priority: number }[] {
  const { transformedBounds } = _sortSectorsByPriorityVars;

  const candidateSectors = new Array<{
    model: CadModelMetadata;
    sectorId: number;
    priority: number;
  }>();
  for (const [model, sectors] of modelsAndCandidateSectors) {
    sectors.forEach(sectorMetadata => {
      const sector = sectorMetadata;
      weightFunctions.computeTransformedSectorBounds(sector.bounds, model.modelMatrix, transformedBounds);
      const priority = determineSectorPriority(weightFunctions, sector, transformedBounds, prioritizedAreas);
      candidateSectors.push({
        model,
        sectorId: sector.id,
        priority
      });
    });
  }
  candidateSectors.sort((left, right) => {
    return right.priority - left.priority;
  });
  return candidateSectors;
}

/**
 * Determines candidate sectors per model, i.e. sectors within frustum.
 */
function determineCandidateSectorsByModel(
  cadModelsMetadata: CadModelMetadata[],
  cameraWorldInverseMatrix: THREE.Matrix4,
  cameraProjectionMatrix: THREE.Matrix4,
  input: DetermineSectorsInput
) {
  return cadModelsMetadata.reduce((result, model) => {
    const sectors = determineCandidateSectors(
      cameraWorldInverseMatrix,
      cameraProjectionMatrix,
      model.modelMatrix,
      model.scene,
      input.clippingPlanes
    );
    result.set(model, sectors);
    return result;
  }, new Map<CadModelMetadata, V9SectorMetadata[]>());
}

/**
 * Prepares data structures with model and sectors
 */
function initializeTakenSectorsAndWeightFunctions(
  modelsAndCandidateSectors: Map<CadModelMetadata, V9SectorMetadata[]>,
  takenSectors: TakenV9SectorMap,
  weightFunctions: WeightFunctionsHelper
) {
  for (const [model, sectors] of modelsAndCandidateSectors) {
    takenSectors.initializeScene(model);
    weightFunctions.addCandidateSectors(sectors, model.modelMatrix);
  }
}

/**
 * Determines candidate sectors, i.e.
 */
function determineCandidateSectors(
  cameraWorldInverseMatrix: THREE.Matrix4,
  cameraProjectionMatrix: THREE.Matrix4,
  modelMatrix: THREE.Matrix4,
  modelScene: SectorScene,
  clippingPlanes: THREE.Plane[]
): V9SectorMetadata[] {
  if (modelScene.version !== 9) {
    throw new Error(`Expected model version 9, but got ${modelScene.version}`);
  }

  const transformedCameraMatrixWorldInverse = new THREE.Matrix4();
  transformedCameraMatrixWorldInverse.multiplyMatrices(cameraWorldInverseMatrix, modelMatrix);
  const sectors = modelScene
    .getSectorsIntersectingFrustum(cameraProjectionMatrix, transformedCameraMatrixWorldInverse)
    .map(x => x as V9SectorMetadata);

  if (clippingPlanes.length <= 0) {
    return sectors;
  }

  const bounds = new THREE.Box3();
  return sectors.filter(sector => {
    bounds.copy(sector.bounds);
    bounds.applyMatrix4(modelMatrix);

    const shouldKeep = clippingPlanes.every(plane => isBox3OnPositiveSideOfPlane(bounds, plane));
    return shouldKeep;
  });
}

/**
 * Determines priority of a single sector.
 */
function determineSectorPriority(
  weightFunctions: WeightFunctionsHelper,
  sector: V9SectorMetadata,
  transformedBounds: THREE.Box3,
  prioritizedAreas: PrioritizedArea[]
) {
  const levelWeightImportance = 2.0;
  const distanceToImportance = 1.0;
  const screenAreaImportance = 0.3;
  const frustumDepthImportance = 0.2;
  const nodeScreenSizeImportance = 1.0;
  const prioritizedAreasImportance = 1.0;

  const levelWeight = weightFunctions.computeSectorTreePlacementWeight(sector);
  const distanceToCameraWeight = weightFunctions.computeDistanceToCameraWeight(transformedBounds);
  const screenAreaWeight = weightFunctions.computeScreenAreaWeight(transformedBounds);
  const frustumDepthWeight = weightFunctions.computeFrustumDepthWeight(transformedBounds);
  const nodeScreenSizeWeight =
    sector.maxDiagonalLength !== undefined
      ? weightFunctions.computeMaximumNodeScreenSizeWeight(transformedBounds, sector.maxDiagonalLength)
      : 1.0;
  const prioritizedAreaWeight = weightFunctions.computePrioritizedAreaWeight(transformedBounds, prioritizedAreas);

  const priority =
    levelWeightImportance * levelWeight +
    distanceToImportance * distanceToCameraWeight +
    screenAreaImportance * screenAreaWeight +
    frustumDepthImportance * frustumDepthWeight +
    nodeScreenSizeImportance * nodeScreenSizeWeight +
    prioritizedAreasImportance * prioritizedAreaWeight;
  return priority;
}
