/*!
 * Copyright 2020 Cognite AS
 */

export interface BinaryFileProvider {
  fetchBinaryFileByUrl(url: string): Promise<Uint8Array>;
}
