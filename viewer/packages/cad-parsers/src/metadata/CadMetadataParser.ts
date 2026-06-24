/*!
 * Copyright 2021 Cognite AS
 */

import type { SectorScene } from '../utilities/types';
import { parseCadMetadataGltf } from './parsers/CadMetadataParserGltf';

interface VersionHeader {
  readonly version: number;
}

export class CadMetadataParser {
  public parse(parsedJson: any): SectorScene {
    const version = (parsedJson as VersionHeader).version;
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
