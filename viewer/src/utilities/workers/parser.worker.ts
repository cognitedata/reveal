/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import { ParsedPrimitives, ParsePrimitiveAttribute, ParseCtmInput } from './types/parser.types';
import * as rustTypes from '../../../pkg';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { SectorQuads, InstancedMesh, InstancedMeshFile, TriangleMesh } from '@/datamodels/cad/rendering/types';
import { DetailedSector } from '@/datamodels/cad/sector/detailedSector_generated';
import { flatbuffers } from 'flatbuffers';
const rustModule = import('../../../pkg');

export class ParserWorker {
  public async parseQuads(buffer: Uint8Array): Promise<SectorQuads> {
    const rust = await rustModule;

    const sectorData = rust.parse_and_convert_f3df(buffer);

    const result = {
      buffer: sectorData.faces(),
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map()
    };

    sectorData.free();

    return result;
  }

  public async parseAndFinalizeDetailed(i3dFile: string, ctmFiles: ParseCtmInput): Promise<SectorGeometry> {
    const rust = await rustModule;
    // TODO mattman22 2020-6-24 Handle parse/finalize errors
    const sectorData = await rust.load_parse_finalize_detailed(i3dFile, ctmFiles.blobUrl, ctmFiles.headers);
    const buf = new flatbuffers.ByteBuffer(sectorData.data);
    const sectorG = DetailedSector.SectorGeometry.getRootAsSectorGeometry(buf);
    const iMeshes: InstancedMeshFile[] = [];
    for (let i = 0; i < sectorG.instanceMeshesLength(); i++) {
      const instances: InstancedMesh[] = [];
      const meshFile = sectorG.instanceMeshes(i)!;
      for (let j = 0; j < meshFile.instancesLength(); j++) {
        const int = meshFile.instances(j)!;
        const colors = int.colorsArray();
        const instanceMatrices = int.instanceMatricesArray();
        const treeIndices = int.treeIndicesArray();
        instances.push({
          triangleCount: int.triangleCount(),
          triangleOffset: int.triangleOffset(),
          colors: colors ? colors : new Uint8Array(),
          instanceMatrices: instanceMatrices ? instanceMatrices : new Float32Array(),
          treeIndices: treeIndices ? treeIndices : new Float32Array()
        });
      }
      const indices = meshFile.indicesArray();
      const vertices = meshFile.verticesArray();
      const norm = meshFile.normalsArray();
      iMeshes.push({
        fileId: meshFile.fileId(),
        indices: indices ? indices : new Uint32Array(),
        vertices: vertices ? vertices : new Float32Array(),
        normals: norm ? norm : undefined,
        instances
      });
    }
    const tMeshes: TriangleMesh[] = [];
    for (let i = 0; i < sectorG.triangleMeshesLength(); i++) {
      const tri = sectorG.triangleMeshes(i)!;
      const indices = tri.indicesArray();
      const treeIndices = tri.treeIndicesArray();
      const vertices = tri.verticesArray();
      const colors = tri.colorsArray();
      const norm = tri.normalsArray();
      tMeshes.push({
        fileId: tri.fileId(),
        indices: indices ? indices : new Uint32Array(),
        treeIndices: treeIndices ? treeIndices : new Float32Array(),
        vertices: vertices ? vertices : new Float32Array(),
        normals: norm ? norm : undefined,
        colors: colors ? colors : new Uint8Array()
      });
    }
    // const iMesh = sectorData.instance_meshes;
    // const tMesh = sectorData.triangle_meshes;
    const sector = sectorData.sector;

    const primitives = this.extractParsedPrimitives(sector);
    // const nodeIdToTreeIndexMap = new Map();
    // const treeIndexToNodeIdMap = new Map();
    // for (let i = 0; i < sectorG.nodeIdsLength(); i++) {
    //   nodeIdToTreeIndexMap.set(sectorG.nodeIds(i), sectorG.treeIndices(i));
    //   treeIndexToNodeIdMap.set(sectorG.treeIndices(i), sectorG.nodeIds(i));
    // }
    const nodeIdToTreeIndexMap = sector.node_id_to_tree_index_map();
    const treeIndexToNodeIdMap = sector.tree_index_to_node_id_map();

    const result: SectorGeometry = {
      nodeIdToTreeIndexMap,
      treeIndexToNodeIdMap,
      primitives,
      instanceMeshes: iMeshes,
      triangleMeshes: tMeshes
    };
    sectorData.free();
    return result;
  }

  private extractParsedPrimitives(sectorData: rustTypes.Sector) {
    const boxCollection = sectorData.box_collection();
    const boxAttributes = this.convertToJSMemory(sectorData.box_attributes() as Map<string, rustTypes.Attribute>);

    const circleCollection = sectorData.circle_collection();
    const circleAttributes = this.convertToJSMemory(sectorData.circle_attributes() as Map<string, rustTypes.Attribute>);

    const coneCollection = sectorData.cone_collection();
    const coneAttributes = this.convertToJSMemory(sectorData.cone_attributes() as Map<string, rustTypes.Attribute>);

    const eccentricConeCollection = sectorData.eccentric_cone_collection();
    const eccentricConeAttributes = this.convertToJSMemory(
      sectorData.eccentric_cone_attributes() as Map<string, rustTypes.Attribute>
    );

    const ellipsoidSegmentCollection = sectorData.ellipsoid_segment_collection();
    const ellipsoidSegmentAttributes = this.convertToJSMemory(
      sectorData.ellipsoid_segment_attributes() as Map<string, rustTypes.Attribute>
    );

    const generalCylinderCollection = sectorData.general_cylinder_collection();
    const generalCylinderAttributes = this.convertToJSMemory(
      sectorData.general_cylinder_attributes() as Map<string, rustTypes.Attribute>
    );

    const generalRingCollection = sectorData.general_ring_collection();
    const generalRingAttributes = this.convertToJSMemory(
      sectorData.general_ring_attributes() as Map<string, rustTypes.Attribute>
    );

    const nutCollection = sectorData.nut_collection();
    const nutAttributes = this.convertToJSMemory(sectorData.nut_attributes() as Map<string, rustTypes.Attribute>);

    const quadCollection = sectorData.quad_collection();
    const quadAttributes = this.convertToJSMemory(sectorData.quad_attributes() as Map<string, rustTypes.Attribute>);

    const sphericalSegmentCollection = sectorData.spherical_segment_collection();
    const sphericalSegmentAttributes = this.convertToJSMemory(
      sectorData.spherical_segment_attributes() as Map<string, rustTypes.Attribute>
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
      trapeziumAttributes
    };

    return parsedPrimitives;
  }

  private convertToJSMemory(rustAttributes: Map<string, rustTypes.Attribute>): Map<string, ParsePrimitiveAttribute> {
    const jsAttributes = new Map<string, ParsePrimitiveAttribute>();

    for (const entry of rustAttributes.entries()) {
      const [key, attribute] = entry;

      jsAttributes.set(key, { size: attribute.size, offset: attribute.offset });

      attribute.free();
    }

    return jsAttributes;
  }
}

const obj = new ParserWorker();

Comlink.expose(obj);
