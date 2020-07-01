/*!
 * Copyright 2020 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';

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

export interface ParsePrimitiveAttribute {
  offset: number;
  size: number;
}

export interface ParsedPrimitives {
  boxCollection: Uint8Array;
  boxAttributes: Map<string, ParsePrimitiveAttribute>;
  circleCollection: Uint8Array;
  circleAttributes: Map<string, ParsePrimitiveAttribute>;
  coneCollection: Uint8Array;
  coneAttributes: Map<string, ParsePrimitiveAttribute>;
  eccentricConeCollection: Uint8Array;
  eccentricConeAttributes: Map<string, ParsePrimitiveAttribute>;
  ellipsoidSegmentCollection: Uint8Array;
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>;
  generalCylinderCollection: Uint8Array;
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>;
  generalRingCollection: Uint8Array;
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>;
  nutCollection: Uint8Array;
  nutAttributes: Map<string, ParsePrimitiveAttribute>;
  quadCollection: Uint8Array;
  quadAttributes: Map<string, ParsePrimitiveAttribute>;
  sphericalSegmentCollection: Uint8Array;
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>;
  torusSegmentCollection: Uint8Array;
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>;
  trapeziumCollection: Uint8Array;
  trapeziumAttributes: Map<string, ParsePrimitiveAttribute>;
}

export interface ParseSectorResult {
  treeIndexToNodeIdMap: Map<number, number>;
  nodeIdToTreeIndexMap: Map<number, number>;
  primitives: ParsedPrimitives;
  instanceMeshes: {
    fileIds: Float64Array;
    treeIndices: Float32Array;
    colors: Uint8Array;
    triangleOffsets: Float64Array;
    triangleCounts: Float64Array;
    sizes: Float32Array;
    instanceMatrices: Float32Array;
  };
  triangleMeshes: {
    fileIds: Float64Array;
    treeIndices: Float32Array;
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

export interface ParseCtmInput {
  blobUrl: string;
  headers: HttpHeaders;
}
export interface ParseQuadsArguments {
  parseQuads: {
    buffer: ArrayBuffer;
  };
}

export type WorkerArguments = ParseRootSectorArguments | ParseSectorArguments | ParseCtmArguments | ParseQuadsArguments;
