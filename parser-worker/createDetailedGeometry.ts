/*!
 * Copyright 2020 Cognite AS
 */

import { InstancedMesh, InstancedMeshFile, ParseCtmResult, ParseSectorResult, SectorGeometry, TriangleMesh } from "./types";

export async function createDetailedGeometry(
  i3dFile: ParseSectorResult,
  ctmFiles: Map<string, ParseCtmResult>
): Promise<SectorGeometry> {
  const { instanceMeshes, triangleMeshes } = i3dFile;

  const finalTriangleMeshes = (() => {
    const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

    const meshesGroupedByFile = groupMeshesByNumber(fileIds);

    const finalMeshes: TriangleMesh[] = [];
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
    const meshesGroupedByFile = groupMeshesByNumber(fileIds);

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
      const fileMeshesGroupedByOffsets = groupMeshesByNumber(fileTriangleOffsets);

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

function groupMeshesByNumber(fileIds: Float64Array) {
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

function createOffsetsArray(array: number[]): number[] {
  if (array.length === 0) {
    return [];
  }

  const offsets = new Array<number>(array.length);
  offsets[0] = 0;
  for (let i = 1; i < array.length; i++) {
    offsets[i] = offsets[i - 1] + array[i - 1];
  }
  return offsets;
}
