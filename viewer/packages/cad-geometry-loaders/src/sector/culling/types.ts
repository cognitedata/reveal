/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { PrioritizedArea } from '@reveal/cad-styling';
import { CadModelMetadata, LevelOfDetail, WantedSector } from '@reveal/cad-parsers';

import { CadLoadingHints } from '../../CadLoadingHints';
import { CadModelBudget } from '../../CadModelBudget';
import { CadNode } from '@reveal/cad-model';

export interface DetermineSectorsInput {
  camera: THREE.PerspectiveCamera;
  clippingPlanes: THREE.Plane[];
  cadModelsMetadata: CadModelMetadata[];
  loadingHints: CadLoadingHints;
  cameraInMotion: boolean;
  budget: CadModelBudget;
  prioritizedAreas: PrioritizedArea[];
}

export type DetermineSectorsPayload = {
  camera: THREE.PerspectiveCamera;
  clippingPlanes: THREE.Plane[];
  models: CadNode[];
  loadingHints: CadLoadingHints;
  cameraInMotion: boolean;
  budget: CadModelBudget;
  prioritizedAreas: PrioritizedArea[];
};

/**
 * Statistics for how much data is required to load set of sectors.
 */
export type SectorLoadingSpent = {
  /**
   * Estimated number of bytes to download sectors.
   */
  readonly downloadSize: number;
  /**
   * Estimated number of draw calls required to draw the sectors.
   */
  readonly drawCalls: number;
  /**
   * Estimated "render cost" which can be compared to triangle count (but
   * due to how Reveal renders primitives doesn't map directly to triangles).
   */
  readonly renderCost: number;

  /**
   * Total number of sectors to load.
   */
  readonly loadedSectorCount: number;
  /**
   * Number of 'simple' sectors to load.
   */
  readonly simpleSectorCount: number;
  /**
   * Number of 'detailed' sectors to load.
   */
  readonly detailedSectorCount: number;
  /**
   * How many sectors that was "forced prioritized".
   */
  readonly forcedDetailedSectorCount: number;
  /**
   * The total number of sectors in models we are loading.
   */
  readonly totalSectorCount: number;
  /**
   * How much of the prioritized nodes that are loaded (between 0 and 1).
   */
  readonly accumulatedPriority: number;
};

export type SectorCost = {
  downloadSize: number;
  drawCalls: number;
  renderCost: number;
};

export function addSectorCost(sum: SectorCost, cost: SectorCost): void {
  sum.downloadSize += cost.downloadSize;
  sum.drawCalls += cost.drawCalls;
  sum.renderCost += cost.renderCost;
}

export function reduceSectorCost(sum: SectorCost, cost: SectorCost): void {
  sum.downloadSize -= cost.downloadSize;
  sum.drawCalls -= cost.drawCalls;
  sum.renderCost -= cost.renderCost;
}

export type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Delegates that computes 'cost' of loading/visualizing a given sector.
 */
export type DetermineSectorCostDelegate<TSectorMetadata> = (
  sector: TSectorMetadata,
  levelOfDetail: LevelOfDetail
) => SectorCost;
