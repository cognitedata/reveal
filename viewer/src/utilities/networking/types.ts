/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from '../File3dFormat';

import { IdEither } from '@cognite/sdk';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface ModelUrlProvider<TModelIdentifier> {
  getModelUrl(params: TModelIdentifier): Promise<string>;
}

export interface ByUrlModelIdentifier {
  discriminator: 'external';
  url: string;
}

export interface CdfModelIdentifier {
  discriminator: 'cdf';
  modelRevision: IdEither;
}
