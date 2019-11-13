/*!
 * Copyright 2019 Cognite AS
 */

export interface ParseRootSectorArguments {
  parseRootSector: {
    buffer: ArrayBuffer;
  };
}
export interface ParseRootSectorResult {
  result: string;
}

export interface ParseSectorArguments {
  parseSector: {
    buffer: ArrayBuffer;
  };
}
export interface ParseSectorResult {
  fileIds: Float64Array;
  nodeIds: Float64Array;
  treeIndexes: Float32Array;
  colors: Uint8Array;
  triangleCounts: Float64Array;
  sizes: Float32Array;
}

export interface ParseCtmArguments {
  parseCtm: {
    buffer: ArrayBuffer;
  };
}
export interface ParseCtmResult {
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
}

export interface ParseQuadsArguments {
  parseQuads: {
    buffer: ArrayBuffer;
  };
}
export interface ParseQuadsResult {
  data: Float32Array;
}

export type WorkerArguments = ParseRootSectorArguments | ParseSectorArguments | ParseCtmArguments | ParseQuadsArguments;
