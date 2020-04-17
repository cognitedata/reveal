/*!
 * Copyright 2020 Cognite AS
 */

import { SectorCuller } from './SectorCuller';
import { determineSectorsByProximity, DetermineSectorsByProximityInput } from '../models/cad/determineSectors';

export class ProximitySectorCuller implements SectorCuller {
  determineSectors(input: DetermineSectorsByProximityInput) {
    return determineSectorsByProximity(input);
  }
}
