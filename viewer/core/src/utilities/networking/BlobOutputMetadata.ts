/*!
 * Copyright 2021 Cognite AS
 */
import { File3dFormat } from '../types';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
