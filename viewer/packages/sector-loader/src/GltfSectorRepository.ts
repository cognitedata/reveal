/*!
 * Copyright 2021 Cognite AS
 */

import { MemoryRequestCache } from '@reveal/utilities';
import { ConsumedSector, V9SectorMetadata, WantedSector, LevelOfDetail } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';
import { SectorRepository } from './SectorRepository';
import { GltfSectorLoader } from './GltfSectorLoader';
import { ok, Result } from 'neverthrow';

export class GltfSectorRepository implements SectorRepository {
  private readonly _gltfSectorLoader: GltfSectorLoader;
  private readonly _gltfCache: MemoryRequestCache<string, ConsumedSector>;

  constructor(sectorFileProvider: BinaryFileProvider, materialManager: CadMaterialManager) {
    this._gltfSectorLoader = new GltfSectorLoader(sectorFileProvider, materialManager);
    this._gltfCache = new MemoryRequestCache(200, async consumedSector => consumedSector.group?.dereference(), 50);
  }

  private async getEmptySectorWithLod(
    lod: LevelOfDetail,
    modelIdentifier: string,
    metadata: V9SectorMetadata
  ): Promise<Result<ConsumedSector, Error>> {
    return ok({
      modelIdentifier,
      metadata,
      levelOfDetail: lod,
      group: undefined,
      instancedMeshes: []
    });
  }

  private async getEmptyDetailedSector(
    modelIdentifier: string,
    metadata: V9SectorMetadata
  ): Promise<Result<ConsumedSector, Error>> {
    return this.getEmptySectorWithLod(LevelOfDetail.Detailed, modelIdentifier, metadata);
  }

  private async getEmptyDiscardedSector(
    modelIdentifier: string,
    metadata: V9SectorMetadata
  ): Promise<Result<ConsumedSector, Error>> {
    return this.getEmptySectorWithLod(LevelOfDetail.Discarded, modelIdentifier, metadata);
  }

  async loadSector(sector: WantedSector): Promise<Result<ConsumedSector, Error>> {
    const metadata = sector.metadata as V9SectorMetadata;

    if (metadata.sectorFileName === undefined || metadata.downloadSize === 0) {
      return this.getEmptyDetailedSector(sector.modelIdentifier, metadata);
    }

    if (sector.levelOfDetail === LevelOfDetail.Discarded) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }

    const cacheKey = this.wantedSectorCacheKey(sector);
    if (this._gltfCache.has(cacheKey)) {
      return ok(this._gltfCache.get(cacheKey));
    }

    const consumedSectorResult = await this._gltfSectorLoader.loadSector(sector);
    if (consumedSectorResult.isErr()) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }
    const consumedSector = consumedSectorResult.value;

    if (!consumedSector) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }

    consumedSector.group?.reference();
    this._gltfCache.forceInsert(cacheKey, consumedSector);

    return ok(consumedSector);
  }

  setCacheSize(sectorCount: number): void {
    this._gltfCache.resize(sectorCount);
  }

  clearCache(): void {
    this._gltfCache.clear();
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return wantedSector.modelIdentifier + '.' + wantedSector.metadata.id;
  }
}
