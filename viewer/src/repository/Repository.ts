/*!
 * Copyright 2020 Cognite AS
 */

import { Sector, SectorQuads } from '../models/cad/types';

export interface Repository {
  getDetailed: (sectorId: number) => Promise<Sector>;
  getSimple: (sectorId: number) => Promise<SectorQuads>;
}
