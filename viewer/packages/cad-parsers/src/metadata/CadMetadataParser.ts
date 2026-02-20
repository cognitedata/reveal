/*!
 * Copyright 2021 Cognite AS
 */

import { SectorScene } from '../utilities/types';
import { parseCadMetadataGltf } from './parsers/CadMetadataParserGltf';
import { CadMetadataWithSignedFiles } from './types';

export class CadMetadataParser {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public parse(parsedJson: any): SectorScene {
    const version = (parsedJson as CadMetadataWithSignedFiles).fileData.version;
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
