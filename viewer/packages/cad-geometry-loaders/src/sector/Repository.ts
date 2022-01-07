/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(sector: WantedSector): Promise<ConsumedSector>;
  clear(): void;
}
