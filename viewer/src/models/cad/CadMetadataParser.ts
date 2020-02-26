/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene } from './types';
import { parseCadMetadataV8 } from './CadMetadataParserV8';

interface VersionHeader {
  readonly version: number;
}

export class CadMetadataParser {
  public parse(jsonText: string): SectorScene {
    const parsed = JSON.parse(jsonText);
    const version = (parsed as VersionHeader).version;
    switch (version) {
      case 8:
        return parseCadMetadataV8(parsed);

      case undefined:
        throw new Error('Metadata must contain a "version"-field');

      default:
        throw new Error(`Version ${version} is not supported`);
    }
  }
}
