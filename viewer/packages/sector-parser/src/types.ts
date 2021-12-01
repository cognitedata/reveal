/*!
 * Copyright 2021 Cognite AS
 */
export type GltfJson = {
  accessors: Accessor[];
  asset: Asset;
  bufferViews: BufferView[];
  buffers: Buffer[];
  extensionsUsed: string[];
  meshes: Mesh[];
  nodes: Node[];
  scene: number;
  scenes: Scene[];
};

export type Scene = {
  nodes: number[];
};

export type Accessor = {
  bufferView: number;
  byteOffset: number | undefined;
  componentType: number;
  count: number;
  type: string;
};

export type Asset = {
  copyright: string;
  generator: string;
  version: string;
};

export type Buffer = {
  byteLength: number;
};

export type BufferView = {
  buffer: number;
  byteLength: number;
  byteOffset: number | undefined;
  byteStride: number;
};

export type Node = {
  name: string;
  mesh: number | undefined;
  extensions: { EXT_mesh_gpu_instancing: { attributes: { [key: string]: number } } | undefined };
};

export type Mesh = {
  primitives: Primitive[];
  extras: { [key: string]: any } | undefined;
};

export type Primitive = {
  attributes: { [key: string]: number };
  indices: number;
};

export enum RevealGeometryCollectionType {
  BoxCollection,
  CircleCollection,
  ConeCollection,
  EccentricConeCollection,
  EllipsoidSegmentCollection,
  GeneralCylinderCollection,
  GeneralRingCollection,
  QuadCollection,
  TorusSegmentCollection,
  TrapeziumCollection,
  NutCollection,
  TriangleMesh,
  InstanceMesh
}

export type GlbHeaderData = {
  json: GltfJson;
  binContentLength: number;
  byteOffsetToBinContent: number;
};

export type GeometryProcessingPayload = {
  geometryType: RevealGeometryCollectionType;
  bufferGeometry: THREE.InstancedBufferGeometry | THREE.BufferGeometry;
  instancingExtension:
    | {
        attributes: {
          [key: string]: number;
        };
      }
    | undefined;
  meshId: number | undefined;
  glbHeaderData: GlbHeaderData;
  data: ArrayBuffer;
};

export type ParsedGeometry = {
  type: RevealGeometryCollectionType;
  geometryBuffer: THREE.BufferGeometry;
  instanceId?: string;
};
