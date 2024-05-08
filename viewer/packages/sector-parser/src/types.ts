/*!
 * Copyright 2021 Cognite AS
 */

import type { InstancedBufferGeometry, BufferGeometry, Texture as ThreeTexture } from 'three';

export type GltfJson = {
  accessors: Accessor[];
  asset: Asset;
  bufferViews: BufferView[];
  buffers: Buffer[];
  extensionsUsed: string[];
  images: Image[];
  materials: Material[];
  meshes: Mesh[];
  nodes: Node[];
  scene: number;
  scenes: Scene[];
  textures: Texture[];
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
  extensions: { KHR_draco_mesh_compression: { attributes: { [key: string]: number }; bufferView: number } | undefined };
  material: number | undefined;
};

export type Material = {
  name: string;
  pbrMetallicRoughness: { baseColorTexture: { index: number } };
};

export type Texture = {
  source: number;
};

export type Image = {
  bufferView: number;
  mimeType: string;
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
  TexturedTriangleMesh,
  InstanceMesh
}

export type GlbHeaderData = {
  json: GltfJson;
  binContentLength: number;
  byteOffsetToBinContent: number;
};

export type GeometryProcessingPayload = {
  geometryType: RevealGeometryCollectionType;
  bufferGeometry: InstancedBufferGeometry | BufferGeometry;
  instancingExtension:
    | {
        attributes: {
          [key: string]: number;
        };
      }
    | undefined;
  meshId: number | undefined;
  glbHeaderData: GlbHeaderData;
  texture?: ThreeTexture;
  data: ArrayBuffer;
};

export type ParsedGeometry = {
  type: RevealGeometryCollectionType;
  geometryBuffer: BufferGeometry;
  texture?: ThreeTexture;
  instanceId?: string;
};
