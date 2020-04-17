/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { MemoryRequestCache } from '../../cache/MemoryRequestCache';
import { CadModel } from '../../models/cad/CadModel';
import { Sector, SectorQuads } from '../../models/cad/types';
import { WantedSector } from '../../data/model/WantedSector';
import { ParsedSector } from '../../data/model/ParsedSector';
import { LevelOfDetail } from '../../data/model/LevelOfDetail';

export class CachedRepository implements Repository {
  private readonly _detailedCache: MemoryRequestCache<number, null, Promise<Sector>>;
  private readonly _simpleCache: MemoryRequestCache<number, null, Promise<SectorQuads>>;

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

  async loadSector(sector: WantedSector): Promise<ParsedSector> {
    const data: null | Sector | SectorQuads = await (() => {
      switch (sector.levelOfDetail) {
        case LevelOfDetail.Discarded:
          return null;
        case LevelOfDetail.Simple:
          return this._simpleCache.request(sector.sectorId, null);
        case LevelOfDetail.Detailed:
          return this._detailedCache.request(sector.sectorId, null);
        default:
          throw new Error(`Unsupported level of detail ${sector.levelOfDetail}`);
      }
    })();
    return {
      id: sector.sectorId,
      levelOfDetail: sector.levelOfDetail,
      data,
      metadata: sector.metadata
    };
  }

  clearCache() {
    this._detailedCache.clearCache();
    this._simpleCache.clearCache();
  }
}
