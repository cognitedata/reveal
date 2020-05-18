/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../WantedSector';
import { LevelOfDetail } from '../LevelOfDetail';
import { SectorMetadata } from '../types';
import { CadModel } from '../../../public/CadModel';
import { CadLoadingHints } from '../../../public/CadLoadingHints';

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
