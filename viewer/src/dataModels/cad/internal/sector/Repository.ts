/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from './WantedSector';
import { OperatorFunction, Observable } from 'rxjs';
import { ConsumedSector } from './ConsumedSector';
import { SectorQuads, Sector } from './types';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector, ConsumedSector>;
  clearSemaphore(): void;

  // Remove later:
  getParsedData(): Observable<{ cadModelIdentifier: string; lod: string; data: Sector | SectorQuads }>;
}
