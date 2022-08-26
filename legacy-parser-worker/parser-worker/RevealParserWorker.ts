/*!
 * Copyright 2021 Cognite AS
 */

import * as Comlink from "comlink";

import { createDetailedGeometry } from "./createDetailedGeometry";
import type * as rustTypes from "./pkg/reveal_rs_wrapper";

const rustModule = import("./pkg/reveal_rs_wrapper");

import {
  ParseCtmResult,
  ParsedPrimitives,
  ParsePrimitiveAttribute,
  ParseSectorResult,
  SectorGeometry,
  SectorQuads,
} from "./types";

declare const VERSION: string;

export class RevealParserWorker {
  // even primitive value must be awaited so it's easier to have it declared as an async fn
  public async getVersion() {
    return VERSION;
  }

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

    return Comlink.transfer(parseResult, [
      parseResult.instanceMeshes.colors.buffer,
      parseResult.instanceMeshes.fileIds.buffer,
      parseResult.instanceMeshes.instanceMatrices.buffer,
      parseResult.instanceMeshes.sizes.buffer,
      parseResult.instanceMeshes.treeIndices.buffer,
      parseResult.instanceMeshes.triangleCounts.buffer,
      parseResult.instanceMeshes.triangleOffsets.buffer,

      parseResult.triangleMeshes.colors.buffer,
      parseResult.triangleMeshes.fileIds.buffer,
      parseResult.triangleMeshes.sizes.buffer,
      parseResult.triangleMeshes.treeIndices.buffer,
      parseResult.triangleMeshes.triangleCounts.buffer,

      parseResult.primitives.boxCollection.buffer,
      parseResult.primitives.circleCollection.buffer,
      parseResult.primitives.coneCollection.buffer,
      parseResult.primitives.eccentricConeCollection.buffer,
      parseResult.primitives.ellipsoidSegmentCollection.buffer,
      parseResult.primitives.generalCylinderCollection.buffer,
      parseResult.primitives.generalRingCollection.buffer,
      parseResult.primitives.nutCollection.buffer,
      parseResult.primitives.quadCollection.buffer,
      parseResult.primitives.sphericalSegmentCollection.buffer,
      parseResult.primitives.torusSegmentCollection.buffer,
      parseResult.primitives.trapeziumCollection.buffer,
    ]);
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

    const transferable: Transferable[] = result.normals !== undefined ?
      [result.indices.buffer, result.normals.buffer, result.vertices.buffer] :
      [result.indices.buffer, result.vertices.buffer];
    return Comlink.transfer(result, transferable);
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

  public async createDetailedGeometry(
    i3dFile: ParseSectorResult,
    ctmFiles: Map<string, ParseCtmResult>
  ): Promise<SectorGeometry> {
    return createDetailedGeometry(i3dFile, ctmFiles);
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
