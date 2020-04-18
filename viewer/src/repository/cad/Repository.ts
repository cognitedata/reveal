/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../../data/model/WantedSector';
import { OperatorFunction } from 'rxjs';
import { ConsumedSector } from '../../data/model/ConsumedSector';

// TODO move
export type SectorId = number;

export interface Repository {
  loadSector(): OperatorFunction<WantedSector, ConsumedSector>;
  clearSemaphore(): void;
}
