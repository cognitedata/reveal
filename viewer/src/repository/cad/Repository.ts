/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../../data/model/WantedSector';
import { ParsedSector } from '../../data/model/ParsedSector';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(sector: WantedSector): Promise<ParsedSector>;
}
