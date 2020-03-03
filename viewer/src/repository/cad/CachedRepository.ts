/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { MemoryRequestCache } from '../../cache/MemoryRequestCache';
import { CadModel } from '../../models/cad/CadModel';
import { Sector, SectorQuads } from '../../models/cad/types';

export class CachedRepository implements Repository {
  private readonly _detailedCache: MemoryRequestCache<number, Sector>;
  private readonly _simpleCache: MemoryRequestCache<number, SectorQuads>;

  constructor(model: CadModel) {
    const getDetailedBasic = async (sectorId: number) => {
      const data = await model.fetchSectorDetailed(sectorId);
      return model.parseDetailed(sectorId, data);
    };

    const getSimpleBasic = async (sectorId: number) => {
      const data = await model.fetchSectorSimple(sectorId);
      return model.parseSimple(sectorId, data);
    };

    this._detailedCache = new MemoryRequestCache(getDetailedBasic);
    this._simpleCache = new MemoryRequestCache(getSimpleBasic);
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
