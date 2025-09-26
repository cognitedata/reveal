/*!
 * Copyright 2021 Cognite AS
 */

import { MemoryRequestCache } from '@reveal/utilities';
import { ConsumedSector, SectorMetadata, WantedSector, LevelOfDetail } from '@reveal/cad-parsers';
import { BinaryFileProvider, ModelIdentifier } from '@reveal/data-providers';
import { SectorRepository } from './SectorRepository';
import { GltfSectorLoader } from './GltfSectorLoader';

export class GltfSectorRepository implements SectorRepository {
  private readonly _gltfSectorLoader: GltfSectorLoader;
  private readonly _gltfCache: MemoryRequestCache<string, ConsumedSector>;

  constructor(sectorFileProvider: BinaryFileProvider) {
    this._gltfSectorLoader = new GltfSectorLoader(sectorFileProvider);

    // Create cache with disposal callback that properly disposes GPU resources
    this._gltfCache = new MemoryRequestCache(200, 50, (sector: ConsumedSector) => {
      sector.parsedMeshGeometries?.forEach(mesh => {
        mesh.geometryBuffer.dispose();
        mesh.texture?.dispose();
      });
    });
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

      // Add reference to prevent disposal while this model uses it
      this._gltfCache.addReference(cacheKey);

      // Note: BufferGeometry is intentionally shared between models for memory efficiency
      return { ...cachedSector, modelIdentifier: sector.modelIdentifier };
    }

    const consumedSector = await this._gltfSectorLoader.loadSector(sector, abortSignal).catch(() => {
      return undefined;
    });

    if (!consumedSector) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }

    this._gltfCache.forceInsert(cacheKey, consumedSector);

    // Add initial reference for this model
    this._gltfCache.addReference(cacheKey);

    return consumedSector;
  }

  setCacheSize(sectorCount: number): void {
    this._gltfCache.resize(sectorCount);
  }

  clearCache(): void {
    this._gltfCache.clear();
  }

  /**
   * Dereferences a sector when a model stops using it.
   * The cache handles reference counting and automatic disposal when count reaches zero.
   * @param modelIdentifier The model identifier that was using the sector
   * @param sectorId The sector ID to dereference
   */
  dereferenceSector(modelIdentifier: ModelIdentifier, sectorId: number): void {
    const cacheKey = modelIdentifier.sourceModelIdentifier() + '.' + sectorId;

    // Let the cache handle reference counting and disposal
    this._gltfCache.removeReference(cacheKey);
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return wantedSector.modelIdentifier.sourceModelIdentifier() + '.' + wantedSector.metadata.id;
  }
}
