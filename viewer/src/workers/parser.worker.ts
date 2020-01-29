/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import { CtmWorkerResult, Sector, SectorMetadata, TriangleMesh } from '../models/cad/types';
import { FetchSectorDelegate, FetchCtmDelegate } from '../models/cad/delegates';
import { createOffsets } from '../utils/arrayUtils';
import {
  ParseRootSectorArguments,
  ParseRootSectorResult,
  ParseSectorArguments,
  ParseSectorResult,
  ParseCtmArguments,
  ParseCtmResult,
  ParseQuadsArguments,
  ParseQuadsResult,
  PrimitiveAttributes
} from './types/parser.types';
import * as rustTypes from '../../pkg';
const rustModule = import('../../pkg');

// TODO see if we can defined this in Rust instead
interface Collection {
  attributes: () => rustTypes.PrimitiveAttributes;
}

function collectAttributes(collection: Collection): PrimitiveAttributes {
  // TODO we might need to call free on collection and the attributes
  return {
    f32Attributes: collection.attributes().f32_attributes(),
    f64Attributes: collection.attributes().f64_attributes(),
    u8Attributes: collection.attributes().u8_attributes(),
    vec3Attributes: collection.attributes().vec3_attributes(),
    vec4Attributes: collection.attributes().vec4_attributes(),
    mat4Attributes: collection.attributes().mat4_attributes()
  };
}

export class ParserWorker {
  private workerId: number;
  private rootSectorHandle: rustTypes.SectorHandle | undefined;
  constructor() {
    this.workerId = Math.floor(Math.random() * 1_000_000_000);
  }
  parseRootSector = async (buffer: Uint8Array): Promise<void> => {
    const rust = await rustModule;
    this.rootSectorHandle = rust.parse_root_sector(buffer);
  };
  parseSector = async (buffer: Uint8Array): Promise<ParseSectorResult> => {
    const rust = await rustModule;
    if (!this.rootSectorHandle) {
      throw new Error(`Worker ${this.workerId} requested to parse sector before parsing root sector!`);
    }
    const sectorDataHandle = rust.parse_sector(this.rootSectorHandle, buffer);
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
      normals,
      colors: new Float32Array(indices.length),
      treeIndices: new Float32Array(indices.length)
    };
    ctm.free();
    return result;
  };
  parseQuads = async (buffer: Uint8Array): Promise<ParseQuadsResult> => {
    const rust = await rustModule;
    const quads = rust.parse_and_convert_f3df(buffer);
    return {
      data: quads
    };
  };
}

const obj = new ParserWorker();

Comlink.expose(obj);
