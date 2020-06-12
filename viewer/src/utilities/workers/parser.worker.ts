/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import {
  ParseSectorResult,
  ParseCtmResult,
  ParseQuadsResult,
  ParsedPrimitives,
  ParsePrimitiveAttribute
} from './types/parser.types';
import { TriangleMesh, InstancedMeshFile, InstancedMesh } from '@/datamodels/cad/rendering/types';
import * as rustTypes from '../../../pkg';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { createOffsetsArray } from '@/utilities';
const rustModule = import('../../../pkg');

export class ParserWorker {
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
      triangleMeshes
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

  public async parseQuads(buffer: Uint8Array): Promise<ParseQuadsResult> {
    const rust = await rustModule;

    const sectorData = rust.parse_and_convert_f3df(buffer);

    const result = {
      faces: sectorData.faces(),
      treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
      nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map()
    };

    sectorData.free();

    return result;
  }

  public async finalizeDetailed(i3dFile: ParseSectorResult, ctmFiles: Map<string, ParseCtmResult>): Promise<SectorGeometry> {
    const { instanceMeshes, triangleMeshes } = i3dFile;

    const finalTriangleMeshes = (() => {
      const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

      const meshesGroupedByFile = this.groupMeshesByNumber(fileIds);

      const finalMeshes = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
        const offsets = createOffsetsArray(fileTriangleCounts);
        // Load CTM (geometry)
        const fileName = `mesh_${fileId}.ctm`;
        const { indices, vertices, normals } = ctmFiles.get(fileName)!; // TODO: j-bjorne 16-04-2020: try catch error???

        const sharedColors = new Uint8Array(3 * indices.length);
        const sharedTreeIndices = new Float32Array(indices.length);

        for (let i = 0; i < meshIndices.length; i++) {
          const meshIdx = meshIndices[i];
          const treeIndex = treeIndices[meshIdx];
          const triOffset = offsets[i];
          const triCount = fileTriangleCounts[i];
          const [r, g, b] = [colors[4 * meshIdx + 0], colors[4 * meshIdx + 1], colors[4 * meshIdx + 2]];
          for (let triIdx = triOffset; triIdx < triOffset + triCount; triIdx++) {
            for (let j = 0; j < 3; j++) {
              const vIdx = indices[3 * triIdx + j];

              sharedTreeIndices[vIdx] = treeIndex;

              sharedColors[3 * vIdx] = r;
              sharedColors[3 * vIdx + 1] = g;
              sharedColors[3 * vIdx + 2] = b;
            }
          }
        }

        const mesh: TriangleMesh = {
          colors: sharedColors,
          fileId,
          treeIndices: sharedTreeIndices,
          indices,
          vertices,
          normals
        };
        finalMeshes.push(mesh);
      }
      return finalMeshes;
    })();

    const finalInstanceMeshes = (() => {
      const { fileIds, colors, treeIndices, triangleCounts, triangleOffsets, instanceMatrices } = instanceMeshes;
      const meshesGroupedByFile = this.groupMeshesByNumber(fileIds);

      const finalMeshes: InstancedMeshFile[] = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      // TODO de-duplicate this with the merged meshes above
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileName = `mesh_${fileId}.ctm`;
        const ctm = ctmFiles.get(fileName)!;

        const indices = ctm.indices;
        const vertices = ctm.vertices;
        const normals = ctm.normals;
        const instancedMeshes: InstancedMesh[] = [];

        const fileTriangleOffsets = new Float64Array(meshIndices.map(i => triangleOffsets[i]));
        const fileTriangleCounts = new Float64Array(meshIndices.map(i => triangleCounts[i]));
        const fileMeshesGroupedByOffsets = this.groupMeshesByNumber(fileTriangleOffsets);

        for (const [triangleOffset, fileMeshIndices] of fileMeshesGroupedByOffsets) {
          // NOTE the triangle counts should be the same for all meshes with the same offset,
          // hence we can look up only fileMeshIndices[0] instead of enumerating here
          const triangleCount = fileTriangleCounts[fileMeshIndices[0]];
          const instanceMatrixBuffer = new Float32Array(16 * fileMeshIndices.length);
          const treeIndicesBuffer = new Float32Array(fileMeshIndices.length);
          const colorBuffer = new Uint8Array(4 * fileMeshIndices.length);
          for (let i = 0; i < fileMeshIndices.length; i++) {
            const meshIdx = meshIndices[fileMeshIndices[i]];
            const treeIndex = treeIndices[meshIdx];
            const instanceMatrix = instanceMatrices.slice(meshIdx * 16, meshIdx * 16 + 16);
            instanceMatrixBuffer.set(instanceMatrix, i * 16);
            treeIndicesBuffer[i] = treeIndex;
            const color = colors.slice(meshIdx * 4, meshIdx * 4 + 4);
            colorBuffer.set(color, i * 4);
          }
          instancedMeshes.push({
            triangleCount,
            triangleOffset,
            instanceMatrices: instanceMatrixBuffer,
            colors: colorBuffer,
            treeIndices: treeIndicesBuffer
          });
        }

        const mesh: InstancedMeshFile = {
          fileId,
          indices,
          vertices,
          normals,
          instances: instancedMeshes
        };
        finalMeshes.push(mesh);
      }

      return finalMeshes;
    })();

    const sector: SectorGeometry = {
      treeIndexToNodeIdMap: i3dFile.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: i3dFile.nodeIdToTreeIndexMap,
      primitives: i3dFile.primitives,
      instanceMeshes: finalInstanceMeshes,
      triangleMeshes: finalTriangleMeshes
    };

    return sector;
  }

  private groupMeshesByNumber(fileIds: Float64Array) {
    const meshesGroupedByFile = new Map<number, number[]>();
    for (let i = 0; i < fileIds.length; ++i) {
      const fileId = fileIds[i];
      const oldValue = meshesGroupedByFile.get(fileId);
      if (oldValue) {
        meshesGroupedByFile.set(fileId, [...oldValue, i]);
      } else {
        meshesGroupedByFile.set(fileId, [i]);
      }
    }
    return meshesGroupedByFile;
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

  private extractTriangleMeshes(sectorData: rustTypes.Sector) {
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
      instanceMatrices: collection.instance_matrix().slice()
    };

    collection.free();

    return result;
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
