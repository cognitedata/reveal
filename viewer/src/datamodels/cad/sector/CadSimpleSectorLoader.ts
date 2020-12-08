/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { BinaryFileProvider } from '../../../utilities/networking/types';
import { MaterialManager } from '../MaterialManager';
import { CadSectorParser } from './CadSectorParser';
import { consumeSectorSimple } from './sectorUtilities';
import { WantedSector } from './types';
import { CancellationSource, downloadWithRetry } from './CadSectorLoader';

export class CadSimpleSectorLoader {
  private readonly _fileProvider: BinaryFileProvider;
  private readonly _parser: CadSectorParser;
  private readonly _materialManager: MaterialManager;

  constructor(fileProvider: BinaryFileProvider, parser: CadSectorParser, materialManager: MaterialManager) {
    this._fileProvider = fileProvider;
    this._parser = parser;
    this._materialManager = materialManager;
  }

  public async load(sector: WantedSector, cancellationSource: CancellationSource): Promise<THREE.Group> {
    const file = sector.metadata.facesFile;
    if (!file.fileName) {
      throw new Error(`Sector '${sector.metadata.path} does not have simple geometry`);
    }
    const materials = this._materialManager.getModelMaterials(sector.blobUrl);
    if (!materials) {
      throw new Error(`Could not find materials for model ${sector.blobUrl}`);
    }

    const buffer = await downloadWithRetry(this._fileProvider, sector.blobUrl, file.fileName!);
    cancellationSource.throwIfCanceled();
    const parsed = await this._parser.parseF3D(new Uint8Array(buffer));
    cancellationSource.throwIfCanceled();
    const geometryGroup = consumeSectorSimple(parsed, materials);
    return geometryGroup;
  }
}
