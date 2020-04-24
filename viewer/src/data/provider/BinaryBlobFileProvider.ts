/*!
 * Copyright 2020 Cognite AS
 */

export interface BinaryBlobFileProvider {
  fetchBinaryFileByPath(blobId: number, filePath: string): Promise<Uint8Array>;
}
