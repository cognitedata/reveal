/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { GltfSectorParser } from '@reveal/sector-parser';
import { SectorRepository } from '..';

export class GltfSectorRepository implements SectorRepository {
  private readonly _gltfSectorParser: GltfSectorParser;
  private readonly _sectorFileProvider: BinaryFileProvider;

  constructor(sectorFileProvider: BinaryFileProvider) {
    this._gltfSectorParser = new GltfSectorParser();
    this._sectorFileProvider = sectorFileProvider;
  }

  async loadSector(sector: WantedSector): Promise<ConsumedSector> {
    const sectorByteBuffer = await this._sectorFileProvider.getBinaryFile(
      sector.modelBaseUrl,
      sector.metadata.id.toString() + '.glb'
    );

    const parsedSectorGeometry = this._gltfSectorParser.parseSector(sectorByteBuffer);

    throw new Error('Method not implemented.');
  }
  clear(): void {
    // do nothing
  }
}
