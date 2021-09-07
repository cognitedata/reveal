/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector } from './types';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(sector: WantedSector): Promise<ConsumedSector>;
  clear(): void;
}
