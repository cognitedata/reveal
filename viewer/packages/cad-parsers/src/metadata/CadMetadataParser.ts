/*!
 * Copyright 2021 Cognite AS
 */

import { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';
import type { SectorScene } from '../utilities/types';
import { parseCadMetadataGltf } from './parsers/CadMetadataParserGltf';
import { CadSceneRootMetadata } from './parsers/types';

export class CadMetadataParser {
  public parse(parsedJson: MetadataWithSignedFiles<CadSceneRootMetadata>): SectorScene {
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
