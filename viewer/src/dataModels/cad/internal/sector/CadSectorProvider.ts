/*!
 * Copyright 2020 Cognite AS
 */

export interface CadSectorProvider {
  getCadSectorFile(blobUrl: string, fileName: string): Promise<ArrayBuffer>;
}
