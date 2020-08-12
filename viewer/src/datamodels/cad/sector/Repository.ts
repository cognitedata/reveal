/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction, Observable } from 'rxjs';
import { ConsumedSector, WantedSector, SectorGeometry } from './types';
import { SectorQuads } from '../rendering/types';
import { LoadingState } from '@/utilities';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector, ConsumedSector>;

  getLoadingStateObservable(): Observable<LoadingState>;
  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }>;
  clear(): void;
}
