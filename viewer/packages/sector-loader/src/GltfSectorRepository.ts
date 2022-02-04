/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, V9SectorMetadata, WantedSector, LevelOfDetail } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';
import { SectorRepository } from './SectorRepository';
import { GltfSectorLoader } from './GltfSectorLoader';

export class GltfSectorRepository implements SectorRepository {
  private readonly _gltfSectorLoader: GltfSectorLoader;

  constructor(sectorFileProvider: BinaryFileProvider, materialManager: CadMaterialManager) {
    this._gltfSectorLoader = new GltfSectorLoader(sectorFileProvider, materialManager);
  }

  private async getEmptySectorWithLod(
    lod: LevelOfDetail,
    modelIdentifier: string,
    metadata: V9SectorMetadata
  ): Promise<ConsumedSector> {
    return Promise.resolve({
      modelIdentifier,
      metadata,
      levelOfDetail: lod,
      group: undefined,
      instancedMeshes: []
    });
  }

  private async getEmptyDetailedSector(modelIdentifier: string, metadata: V9SectorMetadata) {
    return this.getEmptySectorWithLod(LevelOfDetail.Detailed, modelIdentifier, metadata);
  }

  private async getEmptyDiscardedSector(modelIdentifier: string, metadata: V9SectorMetadata) {
    return this.getEmptySectorWithLod(LevelOfDetail.Discarded, modelIdentifier, metadata);
  }

  async loadSector(sector: WantedSector): Promise<ConsumedSector> {
    const metadata = sector.metadata as V9SectorMetadata;

    if (metadata.sectorFileName === undefined || metadata.downloadSize === 0) {
      return this.getEmptyDetailedSector(sector.modelIdentifier, metadata);
    }

    if (sector.levelOfDetail === LevelOfDetail.Discarded) {
      return this.getEmptyDiscardedSector(sector.modelIdentifier, metadata);
    }

    return this._gltfSectorLoader.loadSector(sector);
  }

  clear(): void {}
}
