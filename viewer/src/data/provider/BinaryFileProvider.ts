/*!
 * Copyright 2020 Cognite AS
 */

export interface BinaryFileProvider {
  fetchBinaryFileFromUrl(url: string): Promise<Uint8Array>;
  fetchBinaryFileFromCdf(blobId: number, filePath: string): Promise<Uint8Array>;
}
