/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { ModelIdentifier } from '@reveal/data-providers';

// TODO move
export type SectorId = number;

export interface SectorRepository {
  loadSector(sector: WantedSector, abortSignal?: AbortSignal): Promise<ConsumedSector>;
  setCacheSize(sectorCount: number): void;
  clearCache(): void;
  /**
   * Dereferences a sector when a model stops using it.
   * If this was the last reference, the sector will be disposed.
   */
  dereferenceSector(modelIdentifier: ModelIdentifier, sectorId: number): void;
}
