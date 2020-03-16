/*!
 * Copyright 2020 Cognite AS
 */

import { SectorCuller } from './SectorCuller';
import { DetermineSectorsInput } from '../models/cad/types';
import { map } from 'rxjs/operators';
import { determineSectorsByProximity } from '../models/cad/determineSectors';

export class ProximitySectorCuller implements SectorCuller<DetermineSectorsInput> {
  determineSectors() {
    return map((input: DetermineSectorsInput) => determineSectorsByProximity(input));
  }
}
