/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../../data/model/WantedSector';
import { OperatorFunction, Observable } from 'rxjs';
import { ConsumedSector } from '../../data/model/ConsumedSector';
import { SectorQuads, Sector } from '../../models/cad/types';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector, ConsumedSector>;
  clearSemaphore(): void;

  // Remove later:
  getParsedData(): Observable<{ cadModelIdentifier: string; lod: string; data: Sector | SectorQuads }>;
}
