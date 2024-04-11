/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';

// TODO move
export type SectorId = number;

export type SectorRepository = {
  loadSector(sector: WantedSector, abortSignal?: AbortSignal): Promise<ConsumedSector>;
  setCacheSize(sectorCount: number): void;
  clearCache(): void;
};
