/*!
 * Copyright 2020 Cognite AS
 */

export interface ModelSectorService {
  fetchModelSector(modelId: number, file: string): Promise<Uint8Array>;
}
