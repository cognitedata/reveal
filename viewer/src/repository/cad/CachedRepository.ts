/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { MemoryRequestCache } from '../../cache/MemoryRequestCache';
import { CadModel } from '../../models/cad/CadModel';
import { Sector, SectorQuads } from '../../models/cad/types';
import { flatMap } from 'rxjs/operators';
import { WantedSector } from '../../data/model/WantedSector';
import { OperatorFunction } from 'rxjs';
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

  loadSector(): OperatorFunction<WantedSector, ParsedSector> {
    return flatMap(async (sector: WantedSector) => {
      const data: (null | Sector | SectorQuads) = await (() => {
        switch (sector.levelOfDetail) {
          case LevelOfDetail.Discarded:
            return null;
          case LevelOfDetail.Simple:
            return this._simpleCache.request(sector.id, null);
          case LevelOfDetail.Detailed:
            return this._detailedCache.request(sector.id, null);
          default:
            throw new Error(`Unsupported level of detail ${sector.levelOfDetail}`);
        }
      })();
      return {
        id: sector.id,
        levelOfDetail: sector.levelOfDetail,
        data,
        metadata: sector.metadata
      };
    });
  }

  clearCache() {
    this._detailedCache.clearCache();
    this._simpleCache.clearCache();
  }
}
