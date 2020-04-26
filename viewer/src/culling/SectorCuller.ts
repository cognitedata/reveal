/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../data/model/WantedSector';
import { DetermineSectorsByProximityInput } from '../models/cad/determineSectors';

/**
 * Interface for implementations that are responsible for determining
 * what sectors should be loaded (i.e. "culls" sectors).
 */
export interface SectorCuller {
  determineSectors(input: DetermineSectorsByProximityInput): WantedSector[];
}
