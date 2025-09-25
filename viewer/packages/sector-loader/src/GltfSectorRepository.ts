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
  private readonly _sectorReferenceCounts: Map<string, number> = new Map();

  constructor(sectorFileProvider: BinaryFileProvider) {
    this._gltfSectorLoader = new GltfSectorLoader(sectorFileProvider);
    // Create disposal callback for GPU resources
    const disposeConsumedSector = (sector: ConsumedSector) => {
      // Only dispose GPU resources if no models are using this sector
      const cacheKey = this.getCacheKeyForSector(sector);
      const refCount = this._sectorReferenceCounts.get(cacheKey) || 0;
      if (refCount === 0) {
        sector.parsedMeshGeometries?.forEach(mesh => {
          mesh.geometryBuffer.dispose();
          mesh.texture?.dispose();
        });
      }
      // Clean up reference count entry
      this._sectorReferenceCounts.delete(cacheKey);
    };
    this._gltfCache = new MemoryRequestCache(200, 50, disposeConsumedSector);
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

      // Increment reference count for this model
      const currentCount = this._sectorReferenceCounts.get(cacheKey) || 0;
      this._sectorReferenceCounts.set(cacheKey, currentCount + 1);

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

    // Initialize reference count for this new sector
    this._sectorReferenceCounts.set(cacheKey, 1);

    return consumedSector;
  }

  setCacheSize(sectorCount: number): void {
    this._gltfCache.resize(sectorCount);
  }

  clearCache(): void {
    this._gltfCache.clear();
    this._sectorReferenceCounts.clear();
  }

  /**
   * Dereferences a sector when a model stops using it.
   * Decrements reference count and disposes GPU resources when no models are using the sector.
   * @param modelIdentifier The model identifier that was using the sector
   * @param sectorId The sector ID to dereference
   */
  dereferenceSector(modelIdentifier: ModelIdentifier, sectorId: number): void {
    const cacheKey = modelIdentifier.sourceModelIdentifier() + '.' + sectorId;

    const currentCount = this._sectorReferenceCounts.get(cacheKey);
    if (currentCount === undefined || currentCount <= 0) {
      return; // Sector not referenced or already at zero
    }

    const newCount = currentCount - 1;
    this._sectorReferenceCounts.set(cacheKey, newCount);

    // If no more references and sector is still in cache, dispose GPU resources
    if (newCount === 0 && this._gltfCache.has(cacheKey)) {
      const cachedSector = this._gltfCache.get(cacheKey);
      cachedSector.parsedMeshGeometries?.forEach(mesh => {
        mesh.geometryBuffer.dispose();
        mesh.texture?.dispose();
      });
    }
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return wantedSector.modelIdentifier.sourceModelIdentifier() + '.' + wantedSector.metadata.id;
  }

  private getCacheKeyForSector(sector: ConsumedSector): string {
    return sector.modelIdentifier.sourceModelIdentifier() + '.' + sector.metadata.id;
  }
}
