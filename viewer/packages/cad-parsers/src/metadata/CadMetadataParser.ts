/*!
 * Copyright 2021 Cognite AS
 */

import { parseCadMetadataV8 } from './parsers/CadMetadataParserV8';
import { SectorScene } from '../utilities/types';
import { parseCadMetadataGltf } from './parsers/CadMetadataParserGltf';

interface VersionHeader {
  readonly version: number;
}

export class CadMetadataParser {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public parse(parsedJson: any): SectorScene {
    const version = (parsedJson as VersionHeader).version;
    switch (version) {
      case 8:
        return parseCadMetadataV8(parsedJson);

      case 9:
        return parseCadMetadataGltf(parsedJson);

      case undefined:
        throw new Error('Metadata must contain a "version"-field');

      default:
        throw new Error(`Version ${version} is not supported`);
    }
  }
}
