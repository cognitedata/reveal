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
