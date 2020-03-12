/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction } from 'rxjs';
import { WantedSector } from '../../data/model/WantedSector';
import { ParsedSector } from '../../data/model/ParsedSector';

// TODO move
export type SectorId = number;

export interface Repository {
  getSector: OperatorFunction<WantedSector, ParsedSector>;
}
