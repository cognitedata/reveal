/*!
 * Copyright 2020 Cognite AS
 */

// Could be separated, I would like the format to be generic and not just cad specific

export enum ModelSectorFormat {
  i3d,
  f3d
}

export interface ModelSectorData {
  format: ModelSectorFormat;
  data: Uint8Array;
}
