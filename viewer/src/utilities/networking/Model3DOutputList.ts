/*!
 * Copyright 2020 Cognite AS
 */

import { IdEither } from '@cognite/sdk';
import { BlobOutputMetadata } from './BlobOutputMetadata';
import { File3dFormat } from '../File3dFormat';

export class Model3DOutputList {
  public readonly model: IdEither;
  public readonly outputs: BlobOutputMetadata[];

  constructor(model: IdEither, outputs: BlobOutputMetadata[]) {
    this.model = model;
    this.outputs = outputs;
  }

  /**
   * Finds an output with a given format of the most recent version.
   *
   * @param outputFormat        Format to find output for, either a well known format a custom format.
   * @param supportedVersions   Optional list of supported version. If not provided all versions are considered.
   */
  public findMostRecentOutput(
    outputFormat: File3dFormat | string,
    supportedVersions?: number[]
  ): BlobOutputMetadata | undefined {
    const candidates = this.outputs.filter(
      x => x.format === outputFormat && (!supportedVersions || supportedVersions.indexOf(x.version) !== -1)
    );
    return candidates.length > 0
      ? candidates.reduce((left, right) => {
          return right.version > left.version ? right : left;
        })
      : undefined;
  }
}
