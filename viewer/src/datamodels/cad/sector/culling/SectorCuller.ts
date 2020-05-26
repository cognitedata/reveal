/*!
 * Copyright 2020 Cognite AS
 */

import { DetermineSectorsInput } from './types';
import { WantedSector } from '../types';

/**
 * Interface for implementations that are responsible for determining
 * what sectors should be loaded (i.e. "culls" sectors).
 */
export interface SectorCuller {
  determineSectors(input: DetermineSectorsInput): WantedSector[];
}
