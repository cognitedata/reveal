/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { Result } from 'neverthrow';

// TODO move
export type SectorId = number;

export interface SectorRepository {
  loadSector(sector: WantedSector): Promise<Result<ConsumedSector, Error>>;
  setCacheSize(sectorCount: number): void;
  clearCache(): void;
}
