/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads } from '../../models/cad/types';
import { OperatorFunction } from 'rxjs';
import { WantedSector } from '../../data/model/WantedSector';

// TODO move
export type SectorId = number;

export interface Repository {
  getSector: OperatorFunction<WantedSector, ParsedSector>;
}
