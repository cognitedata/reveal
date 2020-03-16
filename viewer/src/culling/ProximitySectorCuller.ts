/*!
 * Copyright 2020 Cognite AS
 */

import { SectorCuller } from './SectorCuller';
import { map } from 'rxjs/operators';
import { determineSectorsByProximity, DetermineSectorsByProximityInput } from '../models/cad/determineSectors';

export class ProximitySectorCuller implements SectorCuller<DetermineSectorsByProximityInput> {
  determineSectors() {
    return map((input: DetermineSectorsByProximityInput) => determineSectorsByProximity(input));
  }
}
