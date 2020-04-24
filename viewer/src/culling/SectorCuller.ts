/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../data/model/WantedSector';
import { DetermineSectorsByProximityInput } from '../models/cad/determineSectors';

export interface SectorCuller {
  determineSectors(input: DetermineSectorsByProximityInput): WantedSector[];
}
