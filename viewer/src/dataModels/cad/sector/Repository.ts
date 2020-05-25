/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction, Observable } from 'rxjs';
import { SectorGeometry, ConsumedSector, WantedSector } from './types';
import { SectorQuads } from '../rendering/types';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector, ConsumedSector>;
  clearSemaphore(): void;

  // Remove later:
  getParsedData(): Observable<{ cadModelIdentifier: string; lod: string; data: SectorGeometry | SectorQuads }>;
}
