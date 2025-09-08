/*!
 * Copyright 2021 Cognite AS
 */

import { MemoryRequestCache } from '@reveal/utilities';
import { ConsumedSector, SectorMetadata, WantedSector, LevelOfDetail } from '@reveal/cad-parsers';
import { BinaryFileProvider, ModelIdentifier } from '@reveal/data-providers';
import { CadMaterialManager } from '@reveal/rendering';
import { SectorRepository } from './SectorRepository';
import { GltfSectorLoader } from './GltfSectorLoader';

export class GltfSectorRepository implements SectorRepository {
  private readonly _gltfSectorLoader: GltfSectorLoader;
  private readonly _gltfCache: MemoryRequestCache<string, ConsumedSector>;

  constructor(sectorFileProvider: BinaryFileProvider, materialManager: CadMaterialManager) {
    this._gltfSectorLoader = new GltfSectorLoader(sectorFileProvider, materialManager);
    this._gltfCache = new MemoryRequestCache(200, async consumedSector => consumedSector.group?.dereference(), 50);
  }

  private async getEmptySectorWithLod(
    lod: LevelOfDetail,
    modelIdentifier: ModelIdentifier,
    metadata: SectorMetadata
  ): Promise<ConsumedSector> {
    return Promise.resolve({
      modelIdentifier,
      metadata,
      levelOfDetail: lod,
      group: undefined,
      instancedMeshes: []
    });
  }

  private async getEmptyDetailedSector(modelIdentifier: ModelIdentifier, metadata: SectorMetadata) {
    return this.getEmptySectorWithLod(LevelOfDetail.Detailed, modelIdentifier, metadata);
  }

  private async getEmptyDiscardedSector(modelIdentifier: ModelIdentifier, metadata: SectorMetadata) {
    return this.getEmptySectorWithLod(LevelOfDetail.Discarded, modelIdentifier, metadata);
  }

  async loadSector(sector: WantedSector, abortSignal?: AbortSignal): Promise<ConsumedSector> {
    const metadata = sector.metadata as SectorMetadata;

    if (metadata.sectorFileName === undefined || metadata.downloadSize === 0) {
      return this.getEmptyDetailedSector(sector.modelIdentifier, metadata);
    }

    if (sector.levelOfDetail === LevelOfDetail.Discarded) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }

    const cacheKey = this.wantedSectorCacheKey(sector);
    if (this._gltfCache.has(cacheKey)) {
      const cachedSector = this._gltfCache.get(cacheKey);
      return { ...cachedSector, modelIdentifier: sector.modelIdentifier };
    }

    const consumedSector = await this._gltfSectorLoader.loadSector(sector, abortSignal).catch(() => {
      return undefined;
    });

    if (!consumedSector) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }

    consumedSector.group?.reference();
    this._gltfCache.forceInsert(cacheKey, consumedSector);

    return consumedSector;
  }

  setCacheSize(sectorCount: number): void {
    this._gltfCache.resize(sectorCount);
  }

  clearCache(): void {
    this._gltfCache.clear();
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return wantedSector.modelIdentifier.sourceModelIdentifier() + '.' + wantedSector.metadata.id;
  }
}
