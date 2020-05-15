/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../WantedSector';
import { DetermineSectorsByProximityInput } from './determineSectors';

/**
 * Interface for implementations that are responsible for determining
 * what sectors should be loaded (i.e. "culls" sectors).
 */
export interface SectorCuller {
  determineSectors(input: DetermineSectorsByProximityInput): WantedSector[];
}
