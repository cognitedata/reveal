/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { LevelOfDetail } from '../LevelOfDetail';
import { SectorMetadata, WantedSector } from '../types';
import { CadModel } from '../../CadModel';
import { CadLoadingHints } from '../../CadLoadingHints';

export interface DetermineSectorsInput {
  camera: THREE.PerspectiveCamera;
  cadModels: CadModel[];
  loadingHints: CadLoadingHints;
}

export type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Delegates that computes 'cost' of loading/visualizing a given sector.
 */
export type DetermineSectorCostDelegate = (sector: SectorMetadata, levelOfDetail: LevelOfDetail) => number;
