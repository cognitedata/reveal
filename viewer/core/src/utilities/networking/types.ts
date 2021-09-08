/*!
 * Copyright 2021 Cognite AS
 */

import { File3dFormat } from '../types';

export interface LocalModelIdentifier {
  fileName: string;
}

export interface CdfModelIdentifier {
  modelId: number;
  revisionId: number;
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
