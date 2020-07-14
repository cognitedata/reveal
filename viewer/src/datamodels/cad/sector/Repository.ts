/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction, Observable } from 'rxjs';
import { ConsumedSector, WantedSector, SectorGeometry } from './types';
import { SectorQuads } from '../rendering/types';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector[], ConsumedSector>;

  getLoadingStateObserver(): Observable<boolean>;
  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }>;
}
