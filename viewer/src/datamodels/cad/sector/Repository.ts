/*!
 * Copyright 2021 Cognite AS
 */

import { Observable } from 'rxjs';
import { ConsumedSector, WantedSector, SectorGeometry } from './types';
import { SectorQuads } from '../rendering/types';
import { LoadingState } from '../../../utilities';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(sector: WantedSector): Promise<ConsumedSector>;

  getLoadingStateObserver(): Observable<LoadingState>;
  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }>;
  clear(): void;
}
