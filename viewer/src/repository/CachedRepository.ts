/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { createSimpleCache, SimpleCache } from '../models/createCache';
import { CadModel } from '../models/cad/CadModel';
import { Sector, SectorQuads } from '../models/cad/types';

export class CachedRepository implements Repository {
  private readonly _detailedCache: SimpleCache<number, Sector>;
  private readonly _simpleCache: SimpleCache<number, SectorQuads>;

  constructor(model: CadModel) {
    const getDetailedBasic = async (sectorId: number) => {
      const data = await model.fetchSectorDetailed(sectorId);
      return model.parseDetailed(sectorId, data);
    };

    const getSimpleBasic = async (sectorId: number) => {
      const data = await model.fetchSectorSimple(sectorId);
      return model.parseSimple(sectorId, data);
    };

    this._detailedCache = createSimpleCache(getDetailedBasic);
    this._simpleCache = createSimpleCache(getSimpleBasic);
  }

  async getDetailed(sectorId: number): Promise<Sector> {
    return this._detailedCache.request(sectorId);
  }

  async getSimple(sectorId: number): Promise<SectorQuads> {
    return this._simpleCache.request(sectorId);
  }

  clearCache() {
    this._detailedCache.clearCache();
    this._simpleCache.clearCache();
  }
}
