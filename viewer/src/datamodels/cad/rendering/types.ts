/*!
 * Copyright 2021 Cognite AS
 */

export type TriangleMesh = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly treeIndices: Float32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly colors: Uint8Array;
};

export type InstancedMeshFile = {
  readonly fileId: number;
  readonly indices: Uint32Array;
  readonly vertices: Float32Array;
  readonly normals: Float32Array | undefined;
  readonly instances: InstancedMesh[];
};

export type InstancedMesh = {
  readonly triangleCount: number;
  readonly triangleOffset: number;
  readonly colors: Uint8Array;
  readonly instanceMatrices: Float32Array;
  readonly treeIndices: Float32Array;
};

export { SectorQuads } from '@cognite/reveal-parser-worker';
