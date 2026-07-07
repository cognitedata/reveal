/*!
 * Copyright 2021 Cognite AS
 */

import type { SectorScene } from '../utilities/types';
import { parseCadMetadataGltf } from './parsers/CadMetadataParserGltf';
import type { CadMetadataWithSignedFiles } from './types';

export class CadMetadataParser {
  public parse(parsedJson: CadMetadataWithSignedFiles): SectorScene {
    const version = parsedJson.fileData.version;
    switch (version) {
      case 9:
        return parseCadMetadataGltf(parsedJson);

      case undefined:
        throw new Error('Metadata must contain a "version"-field');

      default:
        throw new Error(`Version ${version} is not supported`);
    }
  }
}
