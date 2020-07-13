/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import { ParsedPrimitives, ParsePrimitiveAttribute, ParseCtmInput } from './types/reveal.parser.types';
import * as rustTypes from '../../../pkg';
import { SectorGeometry, FlatSectorGeometry } from '@/datamodels/cad/sector/types';
import { SectorQuads, InstancedMesh, InstancedMeshFile, TriangleMesh } from '@/datamodels/cad/rendering/types';
import { DetailedSector } from '@/datamodels/cad/sector/detailedSector_generated';
import { flatbuffers } from 'flatbuffers';
const rustModule = import('../../../pkg');

export class RevealParserWorker {
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
    const sectorData = await rust.load_parse_finalize_detailed(
      i3dFile,
      ctmFiles.fileNames,
      ctmFiles.blobUrl,
      ctmFiles.headers
    );
    const sector = sectorData.sector;
    const primitives = this.extractParsedPrimitives(sector);
    const nodeIdToTreeIndexMap = sector.node_id_to_tree_index_map();
    const treeIndexToNodeIdMap = sector.tree_index_to_node_id_map();

    const { transferables, result } = this.unflattenSector({
      nodeIdToTreeIndexMap,
      treeIndexToNodeIdMap,
      primitives,
      buffer: sectorData.data
    });
    sector.free();
    sectorData.free();
    return Comlink.transfer(result, [
      ...transferables,
      result.primitives.boxCollection.buffer,
      result.primitives.circleCollection.buffer,
      result.primitives.eccentricConeCollection.buffer,
      result.primitives.ellipsoidSegmentCollection.buffer,
      result.primitives.generalCylinderCollection.buffer,
      result.primitives.generalRingCollection.buffer,
      result.primitives.nutCollection.buffer,
      result.primitives.quadCollection.buffer,
      result.primitives.sphericalSegmentCollection.buffer,
      result.primitives.torusSegmentCollection.buffer,
      result.primitives.trapeziumCollection.buffer
    ]);
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

  private unflattenSector(data: FlatSectorGeometry): { transferables: ArrayBuffer[]; result: SectorGeometry } {
    const buf = new flatbuffers.ByteBuffer(data.buffer);
    const sectorG = DetailedSector.SectorGeometry.getRootAsSectorGeometry(buf);
    const iMeshes: InstancedMeshFile[] = [];
    const transferables = [];
    for (let i = 0; i < sectorG.instanceMeshesLength(); i++) {
      const instances: InstancedMesh[] = [];
      const meshFile = sectorG.instanceMeshes(i)!;
      for (let j = 0; j < meshFile.instancesLength(); j++) {
        const int = meshFile.instances(j)!;
        const colors = new Uint8Array(int.colorsArray()!);
        const instanceMatrices = new Float32Array(int.instanceMatricesArray()!);
        const treeIndices = new Float32Array(int.treeIndicesArray()!);
        transferables.push(colors.buffer);
        transferables.push(instanceMatrices.buffer);
        transferables.push(treeIndices.buffer);
        instances.push({
          triangleCount: int.triangleCount(),
          triangleOffset: int.triangleOffset(),
          colors,
          instanceMatrices,
          treeIndices
        });
      }
      const indices = new Uint32Array(meshFile.indicesArray()!);
      const vertices = new Float32Array(meshFile.verticesArray()!);
      const norm = meshFile.normalsArray();
      transferables.push(indices.buffer);
      transferables.push(vertices.buffer);
      const normals = norm ? new Float32Array(norm) : undefined;
      if (normals) {
        transferables.push(normals.buffer);
      }
      iMeshes.push({
        fileId: meshFile.fileId(),
        indices,
        vertices,
        normals: normals,
        instances
      });
    }
    const tMeshes: TriangleMesh[] = [];
    for (let i = 0; i < sectorG.triangleMeshesLength(); i++) {
      const tri = sectorG.triangleMeshes(i)!;
      const indices = new Uint32Array(tri.indicesArray()!);
      const treeIndices = new Float32Array(tri.treeIndicesArray()!);
      const vertices = new Float32Array(tri.verticesArray()!);
      const colors = new Uint8Array(tri.colorsArray()!);
      const norm = tri.normalsArray();
      transferables.push(indices.buffer);
      transferables.push(treeIndices.buffer);
      transferables.push(vertices.buffer);
      transferables.push(colors.buffer);
      const normals = norm ? new Float32Array(norm) : undefined;
      if (normals) {
        transferables.push(normals.buffer);
      }
      tMeshes.push({
        fileId: tri.fileId(),
        indices,
        treeIndices,
        vertices,
        normals: normals,
        colors
      });
    }
    return {
      transferables,
      result: {
        instanceMeshes: iMeshes,
        triangleMeshes: tMeshes,
        ...data
      }
    };
  }
}

const obj = new RevealParserWorker();

Comlink.expose(obj);
