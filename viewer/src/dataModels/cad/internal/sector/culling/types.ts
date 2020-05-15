/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../WantedSector';
import { LevelOfDetail } from '../LevelOfDetail';
import { SectorMetadata } from '../types';

export type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Delegates that computes 'cost' of loading/visualizing a given sector.
 */
export type DetermineSectorCostDelegate = (sector: SectorMetadata, levelOfDetail: LevelOfDetail) => number;
