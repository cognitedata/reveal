/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from "comlink";

import type * as rustTypes from "./pkg";
const rustModule = import("./pkg");

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

export interface ParseCtmResult {
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
}

export interface SectorQuads {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly treeIndexToNodeIdMap: Map<number, number>;
  readonly buffer: Float32Array;
}

export class RevealParserWorker {
  public async parseSector(buffer: Uint8Array): Promise<ParseSectorResult> {
    const rust = await rustModule;
    const sectorData = rust.parse_and_convert_sector(buffer);

    const instanceMeshes = this.extractInstanceMeshes(sectorData);

    const triangleMeshes = this.extractTriangleMeshes(sectorData);

    const parsedPrimitives = this.extractParsedPrimitives(sectorData);

    const parseResult: ParseSectorResult = {
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map(),
      primitives: parsedPrimitives,
      instanceMeshes,
      triangleMeshes,
    };

    sectorData.free();

    return parseResult;
  }

  public async parseCtm(buffer: Uint8Array): Promise<ParseCtmResult> {
    const rust = await rustModule;

    // TODO handle parsing failure
    const ctm = rust.parse_ctm(buffer);

    const indices = ctm.indices();
    const vertices = ctm.vertices();
    const normals = ctm.normals();

    const result = { indices, vertices, normals };

    ctm.free();

    return result;
  }

  public async parseQuads(buffer: Uint8Array): Promise<SectorQuads> {
    const rust = await rustModule;

    const sectorData = rust.parse_and_convert_f3df(buffer);

    const result = {
      buffer: sectorData.faces(),
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map(),
    };

    sectorData.free();

    return result;
  }

  private extractParsedPrimitives(sectorData: rustTypes.Sector) {
    const boxCollection = sectorData.box_collection();
    const boxAttributes = this.convertToJSMemory(
      sectorData.box_attributes() as Map<string, rustTypes.Attribute>
    );

    const circleCollection = sectorData.circle_collection();
    const circleAttributes = this.convertToJSMemory(
      sectorData.circle_attributes() as Map<string, rustTypes.Attribute>
    );

    const coneCollection = sectorData.cone_collection();
    const coneAttributes = this.convertToJSMemory(
      sectorData.cone_attributes() as Map<string, rustTypes.Attribute>
    );

    const eccentricConeCollection = sectorData.eccentric_cone_collection();
    const eccentricConeAttributes = this.convertToJSMemory(
      sectorData.eccentric_cone_attributes() as Map<string, rustTypes.Attribute>
    );

    const ellipsoidSegmentCollection = sectorData.ellipsoid_segment_collection();
    const ellipsoidSegmentAttributes = this.convertToJSMemory(
      sectorData.ellipsoid_segment_attributes() as Map<
        string,
        rustTypes.Attribute
      >
    );

    const generalCylinderCollection = sectorData.general_cylinder_collection();
    const generalCylinderAttributes = this.convertToJSMemory(
      sectorData.general_cylinder_attributes() as Map<
        string,
        rustTypes.Attribute
      >
    );

    const generalRingCollection = sectorData.general_ring_collection();
    const generalRingAttributes = this.convertToJSMemory(
      sectorData.general_ring_attributes() as Map<string, rustTypes.Attribute>
    );

    const nutCollection = sectorData.nut_collection();
    const nutAttributes = this.convertToJSMemory(
      sectorData.nut_attributes() as Map<string, rustTypes.Attribute>
    );

    const quadCollection = sectorData.quad_collection();
    const quadAttributes = this.convertToJSMemory(
      sectorData.quad_attributes() as Map<string, rustTypes.Attribute>
    );

    const sphericalSegmentCollection = sectorData.spherical_segment_collection();
    const sphericalSegmentAttributes = this.convertToJSMemory(
      sectorData.spherical_segment_attributes() as Map<
        string,
        rustTypes.Attribute
      >
    );

    const torusSegmentCollection = sectorData.torus_segment_collection();
    const torusSegmentAttributes = this.convertToJSMemory(
      sectorData.torus_segment_attributes() as Map<string, rustTypes.Attribute>
    );

    const trapeziumCollection = sectorData.trapezium_collection();
    const trapeziumAttributes = this.convertToJSMemory(
      sectorData.trapezium_attributes() as Map<string, rustTypes.Attribute>
    );

    const parsedPrimitives: ParsedPrimitives = {
      boxCollection,
      boxAttributes,
      circleCollection,
      circleAttributes,
      coneCollection,
      coneAttributes,
      eccentricConeCollection,
      eccentricConeAttributes,
      ellipsoidSegmentCollection,
      ellipsoidSegmentAttributes,
      generalCylinderCollection,
      generalCylinderAttributes,
      generalRingCollection,
      generalRingAttributes,
      nutCollection,
      nutAttributes,
      quadCollection,
      quadAttributes,
      sphericalSegmentCollection,
      sphericalSegmentAttributes,
      torusSegmentCollection,
      torusSegmentAttributes,
      trapeziumCollection,
      trapeziumAttributes,
    };

    return parsedPrimitives;
  }

  private extractTriangleMeshes(sectorData: rustTypes.Sector) {
    const collection = sectorData.triangle_mesh_collection();

    const result = {
      fileIds: collection.file_id().slice(),
      treeIndices: collection.tree_index().slice(),
      colors: collection.color().slice(),
      triangleCounts: collection.triangle_count().slice(),
      sizes: collection.size().slice(),
    };

    collection.free();

    return result;
  }

  private extractInstanceMeshes(sectorData: rustTypes.Sector) {
    const collection = sectorData.instanced_mesh_collection();

    const result = {
      fileIds: collection.file_id().slice(),
      treeIndices: collection.tree_index().slice(),
      colors: collection.color().slice(),
      triangleOffsets: collection.triangle_offset().slice(),
      triangleCounts: collection.triangle_count().slice(),
      sizes: collection.size().slice(),
      instanceMatrices: collection.instance_matrix().slice(),
    };

    collection.free();

    return result;
  }

  private convertToJSMemory(
    rustAttributes: Map<string, rustTypes.Attribute>
  ): Map<string, ParsePrimitiveAttribute> {
    const jsAttributes = new Map<string, ParsePrimitiveAttribute>();

    for (const entry of rustAttributes.entries()) {
      const [key, attribute] = entry;

      jsAttributes.set(key, { size: attribute.size, offset: attribute.offset });

      attribute.free();
    }

    return jsAttributes;
  }
}

const obj = new RevealParserWorker();

Comlink.expose(obj);
