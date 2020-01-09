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

export interface PrimitiveAttributes {
  f32Attributes: Map<string, Float32Array>;
  f64Attributes: Map<string, Float64Array>;
  u8Attributes: Map<string, Uint8Array>;
  vec3Attributes: Map<string, Float32Array>;
  vec4Attributes: Map<string, Float32Array>;
  mat4Attributes: Map<string, Float32Array>;
}

export interface ParseSectorResult {
  boxes: PrimitiveAttributes;
  circles: PrimitiveAttributes;
  cones: PrimitiveAttributes;
  eccentricCones: PrimitiveAttributes;
  ellipsoidSegments: PrimitiveAttributes;
  generalCylinders: PrimitiveAttributes;
  generalRings: PrimitiveAttributes;
  nuts: PrimitiveAttributes;
  quads: PrimitiveAttributes;
  sphericalSegments: PrimitiveAttributes;
  torusSegments: PrimitiveAttributes;
  trapeziums: PrimitiveAttributes;
  instanceMeshes: {
    fileIds: Float64Array;
    nodeIds: Float64Array;
    treeIndexes: Float64Array;
    colors: Uint8Array;
    triangleOffsets: Float64Array;
    triangleCounts: Float64Array;
    sizes: Float32Array;
    instanceMatrices: Float32Array;
  };
  triangleMeshes: {
    fileIds: Float64Array;
    nodeIds: Float64Array;
    treeIndexes: Float64Array;
    colors: Uint8Array;
    triangleCounts: Float64Array;
    sizes: Float32Array;
  };
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
