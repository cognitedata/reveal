/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { LevelOfDetail } from '../LevelOfDetail';
import { SectorMetadata, WantedSector } from '../types';
import { CadModelMetadata } from '../../CadModelMetadata';
import { CadLoadingHints } from '../../CadLoadingHints';
import { CadModelSectorBudget } from '../../CadModelSectorBudget';

export interface DetermineSectorsInput {
  camera: THREE.PerspectiveCamera;
  clippingPlanes: THREE.Plane[];
  clipIntersection: boolean;
  cadModelsMetadata: CadModelMetadata[];
  loadingHints: CadLoadingHints;
  cameraInMotion: boolean;
  budget: CadModelSectorBudget;
}

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
};

export function addSectorCost(sum: SectorCost, cost: SectorCost) {
  sum.downloadSize += cost.downloadSize;
  sum.drawCalls += cost.drawCalls;
}

export function reduceSectorCost(sum: SectorCost, cost: SectorCost) {
  sum.downloadSize -= cost.downloadSize;
  sum.drawCalls -= cost.drawCalls;
}

export type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Delegates that computes 'cost' of loading/visualizing a given sector.
 */
export type DetermineSectorCostDelegate = (sector: SectorMetadata, levelOfDetail: LevelOfDetail) => SectorCost;
