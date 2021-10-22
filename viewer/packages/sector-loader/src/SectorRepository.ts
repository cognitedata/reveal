/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';

// TODO move
export type SectorId = number;

export interface SectorRepository {
  loadSector(sector: WantedSector): Promise<ConsumedSector>;
  clear(): void;
}
