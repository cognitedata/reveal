/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import { ParseSectorResult, ParseCtmResult, ParseQuadsResult, PrimitiveAttributes } from './types/parser.types';
import * as rustTypes from '../../pkg';
const rustModule = import('../../pkg');

// TODO see if we can defined this in Rust instead
interface Collection {
  attributes: () => rustTypes.PrimitiveAttributes;
  free: () => void;
}

function collectAttributes(collection: Collection): PrimitiveAttributes {
  const attributes = collection.attributes();
  const result = {
    f32Attributes: attributes.f32_attributes(),
    f64Attributes: attributes.f64_attributes(),
    u8Attributes: attributes.u8_attributes(),
    vec3Attributes: attributes.vec3_attributes(),
    vec4Attributes: attributes.vec4_attributes(),
    mat4Attributes: attributes.mat4_attributes()
  };
  attributes.free();
  collection.free();
  return result;
}

export class ParserWorker {
  parseSector = async (buffer: Uint8Array): Promise<ParseSectorResult> => {
    const rust = await rustModule;
    const sectorDataHandle = rust.parse_sector(buffer);
    const sectorData = rust.convert_sector(sectorDataHandle);
    const instanceMeshes = (() => {
      const collection = sectorData.instanced_mesh_collection();
      const result = {
        fileIds: collection.file_id().slice(),
        nodeIds: collection.node_id().slice(),
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
        nodeIds: collection.node_id().slice(),
        treeIndices: collection.tree_index().slice(),
        colors: collection.color().slice(),
        triangleCounts: collection.triangle_count().slice(),
        sizes: collection.size().slice()
      };
      collection.free();
      return result;
    })();

    // TODO add instanced meshes

    const boxes = collectAttributes(sectorData.box_collection());
    const circles = collectAttributes(sectorData.circle_collection());
    const cones = collectAttributes(sectorData.cone_collection());
    const eccentricCones = collectAttributes(sectorData.eccentric_cone_collection());
    const ellipsoidSegments = collectAttributes(sectorData.ellipsoid_segment_collection());
    const generalCylinders = collectAttributes(sectorData.general_cylinder_collection());
    const generalRings = collectAttributes(sectorData.general_ring_collection());
    const nuts = collectAttributes(sectorData.nut_collection());
    const quads = collectAttributes(sectorData.quad_collection());
    const sphericalSegments = collectAttributes(sectorData.spherical_segment_collection());
    const torusSegments = collectAttributes(sectorData.torus_segment_collection());
    const trapeziums = collectAttributes(sectorData.trapezium_collection());

    const parseResult: ParseSectorResult = {
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map(),
      boxes,
      circles,
      cones,
      eccentricCones,
      ellipsoidSegments,
      generalCylinders,
      generalRings,
      instanceMeshes,
      nuts,
      quads,
      sphericalSegments,
      torusSegments,
      trapeziums,
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
    return {
      faces: sectorData.faces(),
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map()
    };
  };
}

const obj = new ParserWorker();

Comlink.expose(obj);
