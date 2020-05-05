/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import { ParseSectorResult, ParseCtmResult, ParseQuadsResult, ParsedPrimitives, ParsePrimitiveAttribute } from './types/parser.types';
import * as rustTypes from '../../pkg';
const rustModule = import('../../pkg');

export class ParserWorker {
  parseSector = async (buffer: Uint8Array): Promise<ParseSectorResult> => {
    const rust = await rustModule;
    const sectorDataHandle = rust.parse_sector(buffer);
    const sectorData = rust.convert_sector(sectorDataHandle);
    const instanceMeshes = (() => {
      const collection = sectorData.instanced_mesh_collection();
      const result = {
        fileIds: collection.file_id().slice(),
        treeIndices: collection.tree_index().slice(),
        colors: collection.color().slice(),
        triangleOffsets: collection.triangle_offset().slice(),
        triangleCounts: collection.triangle_count().slice(),
        sizes: collection.size().slice(),
        instanceMatrices: collection.instance_matrix().slice()
      };
      collection.free();
      return result;
    })();
    const triangleMeshes = (() => {
      const collection = sectorData.triangle_mesh_collection();
      const result = {
        fileIds: collection.file_id().slice(),
        treeIndices: collection.tree_index().slice(),
        colors: collection.color().slice(),
        triangleCounts: collection.triangle_count().slice(),
        sizes: collection.size().slice()
      };
      collection.free();
      return result;
    })();

    // TODO add instanced meshes
    // TODO calling sectorData.box_collection() should give uint8 array sectorData.box_attributes should give attribute map

    const boxCollection = sectorData.box_collection();
    const boxAttributes = this.convertToJSMemory(sectorData.box_attributes() as Map<string, rustTypes.Attribute>); 

    const circleCollection = sectorData.circle_collection();
    const circleAttributes = this.convertToJSMemory(sectorData.circle_attributes() as Map<string, rustTypes.Attribute>);

    const coneCollection = sectorData.cone_collection();
    const coneAttributes = this.convertToJSMemory(sectorData.cone_attributes() as Map<string, rustTypes.Attribute>);

    const eccentricConeCollection = sectorData.eccentric_cone_collection();
    const eccentricConeAttributes = this.convertToJSMemory(sectorData.eccentric_cone_attributes() as Map<string, rustTypes.Attribute>);

    const ellipsoidSegmentCollection = sectorData.ellipsoid_segment_collection();
    const ellipsoidSegmentAttributes = this.convertToJSMemory(sectorData.ellipsoid_segment_attributes() as Map<string, rustTypes.Attribute>);

    const generalCylinderCollection = sectorData.general_cylinder_collection();
    const generalCylinderAttributes = this.convertToJSMemory(sectorData.general_cylinder_attributes() as Map<string, rustTypes.Attribute>);

    const generalRingCollection = sectorData.general_ring_collection();
    const generalRingAttributes = this.convertToJSMemory(sectorData.general_ring_attributes() as Map<string, rustTypes.Attribute>);

    const nutCollection = sectorData.nut_collection();
    const nutAttributes = this.convertToJSMemory(sectorData.nut_attributes() as Map<string, rustTypes.Attribute>);

    const quadCollection = sectorData.quad_collection();
    const quadAttributes = this.convertToJSMemory(sectorData.quad_attributes() as Map<string, rustTypes.Attribute>);
    
    const sphericalSegmentCollection = sectorData.spherical_segment_collection();
    const sphericalSegmentAttributes = this.convertToJSMemory(sectorData.spherical_segment_attributes() as Map<string, rustTypes.Attribute>);

    const torusSegmentCollection = sectorData.torus_segment_collection();
    const torusSegmentAttributes = this.convertToJSMemory(sectorData.torus_segment_attributes() as Map<string, rustTypes.Attribute>);

    const trapeziumCollection = sectorData.trapezium_collection();
    const trapeziumAttributes = this.convertToJSMemory(sectorData.trapezium_attributes() as Map<string, rustTypes.Attribute>);

    const parsedPrimitives: ParsedPrimitives = {
      boxCollection, boxAttributes: boxAttributes,
      circleCollection, circleAttributes,
      coneCollection, coneAttributes,
      eccentricConeCollection, eccentricConeAttributes,
      ellipsoidSegmentCollection, ellipsoidSegmentAttributes,
      generalCylinderCollection, generalCylinderAttributes,
      generalRingCollection, generalRingAttributes,
      nutCollection, nutAttributes,
      quadCollection, quadAttributes,
      sphericalSegmentCollection, sphericalSegmentAttributes,
      torusSegmentCollection, torusSegmentAttributes,
      trapeziumCollection, trapeziumAttributes
    }

    const parseResult: ParseSectorResult = {
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map(),
      primitives: parsedPrimitives,
      instanceMeshes,
      triangleMeshes
    };

    sectorData.free();
    sectorDataHandle.free();

    return parseResult;
  };
  parseCtm = async (buffer: Uint8Array): Promise<ParseCtmResult> => {
    const rust = await rustModule;
    // TODO handle parsing failure
    const ctm = rust.parse_ctm(buffer);
    const indices = ctm.indices();
    const vertices = ctm.vertices();
    const normals = ctm.normals();
    const result = {
      indices,
      vertices,
      normals
    };
    ctm.free();
    return result;
  };
  parseQuads = async (buffer: Uint8Array): Promise<ParseQuadsResult> => {
    const rust = await rustModule;
    const sectorData = rust.parse_and_convert_f3df(buffer);
    const result = {
      faces: sectorData.faces(),
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map()
    };
    sectorData.free();
    return result;
  };

  private freeAttributes(attributes: Map<string, rustTypes.Attribute>){
    for(const attribute of attributes.values()){
      attribute.free();
    }
  }

  private convertToJSMemory(rustAttributes: Map<string, rustTypes.Attribute>): Map<string, ParsePrimitiveAttribute>{
    const jsAttributes = new Map<string, ParsePrimitiveAttribute>();
    for (const entry of rustAttributes.entries()) {
      const [key, attribute] = entry;
      jsAttributes.set(key, {size:attribute.size, offset: attribute.offset});
    }

    this.freeAttributes(rustAttributes);

    return jsAttributes;
  }
}

const obj = new ParserWorker();

Comlink.expose(obj);
