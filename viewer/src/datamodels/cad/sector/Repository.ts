/*!
 * Copyright 2021 Cognite AS
 */

import { OperatorFunction, Observable } from 'rxjs';
import { ConsumedSector, WantedSector } from './types';
import { LoadingState } from '../../../utilities';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector, ConsumedSector>;
  getLoadingStateObserver(): Observable<LoadingState>;
  clear(): void;
}
