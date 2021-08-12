/*!
 * Copyright 2021 Cognite AS
 */

import { WorkerPool } from '../../../utilities/workers/WorkerPool';
import {
  ParseSectorResult,
  ParseCtmResult,
  ParsedPrimitives,
  RevealParserWorker,
  ParsePrimitiveAttribute
} from '@cognite/reveal-parser-worker';
import { SectorQuads } from '../rendering/types';

import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import * as THREE from 'three';
import {
  getBoxOutputSize,
  getCircleOutputSize,
  getConeOutputSize,
  getEccentricConeOutputSize,
  getEllipsoidSegmentOutputSize,
  getGeneralCylinderOutputSize,
  getGeneralRingOutputSize,
  getNutOutputSize,
  getQuadOutputSize,
  getSphericalSegmentOutputSize,
  getTorusSegmentOutputSize,
  getTrapeziumOutputSize,
  transformBoxes,
  transformCircles,
  transformClosedCones,
  transformClosedCylinders,
  transformClosedEccentricCones,
  transformClosedEllipsoidSegments,
  transformClosedExtrudedRingSegments,
  transformClosedGeneralCones,
  transformClosedGeneralCylinders,
  transformClosedSphericalSegments,
  transformClosedTorusSegments,
  transformEllipsoids,
  transformExtrudedRings,
  transformNuts,
  transformOpenCones,
  transformOpenCylinders,
  transformOpenEccentricCones,
  transformOpenEllipsoidSegments,
  transformOpenExtrudedRingSegments,
  transformOpenGeneralCones,
  transformOpenGeneralCylinders,
  transformOpenSphericalSegments,
  transformOpenTorusSegments,
  transformRings,
  transformSolidClosedGeneralCones,
  transformSolidClosedGeneralCylinders,
  transformSolidOpenGeneralCones,
  transformSolidOpenGeneralCylinders,
  transformSpheres,
  transformToruses
} from './primitiveTransformers';

export interface ParseGltfResult {
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
  meshNameToOffsetCountMap: Map<string, { triangleOffset: number; triangleCount: number }>;
}

export interface ParseExtendedGltfResult {
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
  meshNameToOffsetCountMap: Map<string, { triangleOffset: number; triangleCount: number }>;
  parsedPrimitives?: ParsedPrimitives;
}

/*
 * For primitive parsing from glTF
 */

interface PrimitiveSpec {
  byteOffset: number;
  byteCount: number;
}

interface AllPrimitiveSpecs {
  bufferView: number;
  boxes: PrimitiveSpec;

  circles: PrimitiveSpec;
  closedCones: PrimitiveSpec;
  closedCylinders: PrimitiveSpec;
  closedEccentricCones: PrimitiveSpec;
  closedEllipsoidSegments: PrimitiveSpec;
  closedExtrudedRingSegments: PrimitiveSpec;
  closedSphericalSegments: PrimitiveSpec;
  closedTorusSegments: PrimitiveSpec;
  ellipsoids: PrimitiveSpec;
  extrudedRings: PrimitiveSpec;
  nuts: PrimitiveSpec;
  openCones: PrimitiveSpec;
  openCylinders: PrimitiveSpec;
  openEccentricCones: PrimitiveSpec;
  openEllipsoidSegments: PrimitiveSpec;
  openExtrudedRingSegments: PrimitiveSpec;
  openSphericalSegments: PrimitiveSpec;
  openTorusSegments: PrimitiveSpec;
  rings: PrimitiveSpec;
  spheres: PrimitiveSpec;
  toruses: PrimitiveSpec;
  openGeneralCylinders: PrimitiveSpec;
  closedGeneralCylinders: PrimitiveSpec;
  solidOpenGeneralCylinders: PrimitiveSpec;
  solidClosedGeneralCylinders: PrimitiveSpec;
  openGeneralCones: PrimitiveSpec;
  closedGeneralCones: PrimitiveSpec;
  solidOpenGeneralCones: PrimitiveSpec;
  solidClosedGeneralCones: PrimitiveSpec;
}

interface InstanceMeshSpec {
  // Each number is an index to a buffer
  fileId: number;
  treeIndices: number;
  colors: number;
  triangleOffsets: number;
  triangleCounts: number;
  instanceMatrices: number;
}

interface ExtendedGltfExtra {
  primitives: AllPrimitiveSpecs;
  instanceMeshes: InstanceMeshSpec;
}

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  private readonly dracoLoader: DRACOLoader;

  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco_decoder/');
    this.dracoLoader.preload();
  }

  parseI3D(data: Uint8Array): Promise<ParseSectorResult> {
    return this.parseDetailed(data);
  }

  parseF3D(data: Uint8Array): Promise<SectorQuads> {
    return this.parseSimple(data);
  }

  parseCTM(data: Uint8Array): Promise<ParseCtmResult> {
    return this.parseCtm(data);
  }

  parseGltf(data: string): Promise<ParseGltfResult> {
    return this.parseGltfInner(data);
  }

  parseExtendedGltf(data: string): Promise<ParseExtendedGltfResult> {
    return this.parseExtendedGltfInner(data);
  }

  private async parseSimple(quadsArrayBuffer: Uint8Array): Promise<SectorQuads> {
    return this.workerPool.postWorkToAvailable<SectorQuads>(async (worker: RevealParserWorker) =>
      worker.parseQuads(quadsArrayBuffer)
    );
  }

  private async parseDetailed(sectorArrayBuffer: Uint8Array): Promise<ParseSectorResult> {
    return this.workerPool.postWorkToAvailable(async (worker: RevealParserWorker) =>
      worker.parseSector(sectorArrayBuffer)
    );
  }

  private async parseCtm(ctmArrayBuffer: Uint8Array): Promise<ParseCtmResult> {
    return this.workerPool.postWorkToAvailable(async (worker: RevealParserWorker) => worker.parseCtm(ctmArrayBuffer));
  }

  private parseGltfInner(fileName: string): Promise<ParseGltfResult> {
    return new Promise<ParseGltfResult>((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.setDRACOLoader(this.dracoLoader);

      loader.load(
        fileName,
        (gltf: GLTF) => {
          let foundGeometry = false;

          let allVertices = new Float32Array();
          let allIndices = new Uint32Array();
          let allNormals = new Float32Array();

          const meshNameToOffsetCount = new Map<string, { triangleOffset: number; triangleCount: number }>();

          const meshes: THREE.Mesh<any, any>[] = [];

          gltf.scene.traverse((obj: THREE.Object3D) => {
            if (obj instanceof THREE.Mesh) {
              foundGeometry = true;
              meshes.push(obj as THREE.Mesh);
            }
          });

          if (!foundGeometry) {
            reject('Could not find any geometry');
          }

          // TODO: Figure out why this is needed
          meshes.sort((mesh0, mesh1) => (mesh0.name < mesh1.name ? -1 : 1));

          for (const mesh of meshes) {
            const triangleStart = allIndices.length / 3;

            // Starting index for this mesh inside the whole vertex list
            const startIndex = allVertices.length / 3;

            allVertices = this.addSpatialAttributes(allVertices, mesh.geometry.attributes['position'].array);
            allIndices = this.addIndices(allIndices, mesh.geometry.index.array, startIndex);

            const triangleCount = allIndices.length / 3 - triangleStart;

            if ('normals' in mesh.geometry.attributes) {
              allNormals = this.addSpatialAttributes(allNormals, mesh.geometry.attributes['normals'].array);
            }

            meshNameToOffsetCount.set(mesh.name, { triangleOffset: triangleStart, triangleCount: triangleCount });
          }

          // If attributes differ in length, set normals to null
          const finalNormals = allNormals.length == allVertices.length ? allNormals : undefined;

          resolve({
            vertices: allVertices,
            indices: allIndices,
            normals: finalNormals,
            meshNameToOffsetCountMap: meshNameToOffsetCount
          });
        },
        () => {},
        () => {
          throw new Error('Error when loading GLTF.');
        }
      );
    });
  }

  private parseExtendedGltfInner(fileName: string): Promise<ParseExtendedGltfResult> {
    return new Promise<ParseExtendedGltfResult>((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.setDRACOLoader(this.dracoLoader);

      loader.load(
        fileName,
        (gltf: GLTF) => {
          let foundGeometry = false;

          let allVertices = new Float32Array();
          let allIndices = new Uint32Array();
          let allNormals = new Float32Array();

          const meshNameToOffsetCount = new Map<string, { triangleOffset: number; triangleCount: number }>();

          const meshes: THREE.Mesh<any, any>[] = [];

          gltf.scene.traverse((obj: THREE.Object3D) => {
            if (obj instanceof THREE.Mesh) {
              foundGeometry = true;
              meshes.push(obj as THREE.Mesh);
            }
          });

          if (!foundGeometry) {
            reject('Could not find any geometry');
          }

          meshes.sort((mesh0, mesh1) => (mesh0.name < mesh1.name ? -1 : 1));

          for (const mesh of meshes) {
            const triangleStart = allIndices.length / 3;

            // Starting index for this mesh inside the whole vertex list
            const startIndex = allVertices.length / 3;

            allVertices = this.addSpatialAttributes(allVertices, mesh.geometry.attributes['position'].array);
            allIndices = this.addIndices(allIndices, mesh.geometry.index.array, startIndex);

            const triangleCount = allIndices.length / 3 - triangleStart;

            if ('normals' in mesh.geometry.attributes) {
              allNormals = this.addSpatialAttributes(allNormals, mesh.geometry.attributes['normals'].array);
            }

            meshNameToOffsetCount.set(mesh.name, { triangleOffset: triangleStart, triangleCount: triangleCount });
          }

          // If attributes differ in length, set normals to null
          const finalNormals = allNormals.length == allVertices.length ? allNormals : undefined;

          const extraData = gltf.userData as ExtendedGltfExtra;

          if (!extraData || !('primitives' in extraData)) {
            resolve({
              vertices: allVertices,
              indices: allIndices,
              normals: finalNormals,
              meshNameToOffsetCountMap: meshNameToOffsetCount
            });
            return;
          }

          const primitiveSpecs = extraData.primitives;

          gltf.parser
            .loadBufferView(primitiveSpecs.bufferView)
            .then(bufferView => {
              const buffer = bufferView.slice(0) as Uint8Array;

              const parsedPrimitives = this.parsePrimitives(buffer, primitiveSpecs);

              resolve({
                vertices: allVertices,
                indices: allIndices,
                normals: finalNormals,
                meshNameToOffsetCountMap: meshNameToOffsetCount,
                parsedPrimitives
              });
            })
            .catch(err => reject(err));
        },
        () => {},
        () => {
          throw new Error('Error when loading GLTF.');
        }
      );
    });
  }

  private parsePrimitives(buffer: Uint8Array, primitiveSpecs: AllPrimitiveSpecs): ParsedPrimitives {
    const boxAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['instanceMatrix', { offset: 8, size: 64 }]
    ]);

    const circleAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['normal', { offset: 8, size: 12 }],
      ['instanceMatrix', { offset: 20, size: 64 }]
    ]);

    const coneAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['centerA', { offset: 8, size: 12 }],
      ['centerB', { offset: 20, size: 12 }],
      ['radiusA', { offset: 32, size: 4 }],
      ['radiusB', { offset: 36, size: 4 }],
      ['angle', { offset: 40, size: 4 }],
      ['arcAngle', { offset: 44, size: 4 }],
      ['localXAxis', { offset: 48, size: 12 }]
    ]);

    const eccentricConeAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['centerA', { offset: 8, size: 12 }],
      ['centerB', { offset: 20, size: 12 }],
      ['radiusA', { offset: 32, size: 4 }],
      ['radiusB', { offset: 36, size: 4 }],
      ['normal', { offset: 40, size: 12 }]
    ]);

    const ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['center', { offset: 8, size: 12 }],
      ['normal', { offset: 20, size: 12 }],
      ['horizontalRadius', { offset: 32, size: 4 }],
      ['verticalRadius', { offset: 36, size: 4 }],
      ['height', { offset: 40, size: 4 }]
    ]);

    const generalCylinderAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['centerA', { offset: 8, size: 12 }],
      ['centerB', { offset: 20, size: 12 }],
      ['radius', { offset: 32, size: 4 }],
      ['angle', { offset: 36, size: 4 }],
      ['planeA', { offset: 40, size: 16 }],
      ['planeB', { offset: 56, size: 16 }],
      ['arcAngle', { offset: 72, size: 4 }],
      ['localXAxis', { offset: 76, size: 12 }]
    ]);

    const generalRingAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['normal', { offset: 8, size: 12 }],
      ['thickness', { offset: 20, size: 4 }],
      ['angle', { offset: 24, size: 4 }],
      ['arcAngle', { offset: 28, size: 4 }],
      ['instanceMatrix', { offset: 32, size: 64 }]
    ]);

    const nutAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['instanceMatrix', { offset: 8, size: 64 }]
    ]);

    const quadAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['instanceMatrix', { offset: 8, size: 64 }]
    ]);

    const sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['center', { offset: 8, size: 12 }],
      ['normal', { offset: 20, size: 12 }],
      ['radius', { offset: 32, size: 4 }],
      ['height', { offset: 36, size: 4 }]
    ]);

    const torusSegmentAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['size', { offset: 8, size: 4 }],
      ['radius', { offset: 12, size: 4 }],
      ['tubeRadius', { offset: 16, size: 4 }],
      ['arcAngle', { offset: 20, size: 4 }],
      ['instanceMatrix', { offset: 24, size: 64 }]
    ]);

    const trapeziumAttributes: Map<string, ParsePrimitiveAttribute> = new Map<string, ParsePrimitiveAttribute>([
      ['treeIndex', { offset: 0, size: 4 }],
      ['color', { offset: 4, size: 4 }],
      ['vertex1', { offset: 8, size: 12 }],
      ['vertex2', { offset: 20, size: 12 }],
      ['vertex3', { offset: 32, size: 12 }],
      ['vertex4', { offset: 44, size: 12 }]
    ]);

    const boxSlice = buffer.slice(
      primitiveSpecs.boxes.byteOffset,
      primitiveSpecs.boxes.byteOffset + primitiveSpecs.boxes.byteCount
    );

    const circleSlice = buffer.slice(
      primitiveSpecs.circles.byteOffset,
      primitiveSpecs.circles.byteOffset + primitiveSpecs.circles.byteCount
    );
    const closedConeSlice = buffer.slice(
      primitiveSpecs.closedCones.byteOffset,
      primitiveSpecs.closedCones.byteOffset + primitiveSpecs.closedCones.byteCount
    );
    const closedCylinderSlice = buffer.slice(
      primitiveSpecs.closedCylinders.byteOffset,
      primitiveSpecs.closedCylinders.byteOffset + primitiveSpecs.closedCylinders.byteCount
    );
    const closedEccentricConeSlice = buffer.slice(
      primitiveSpecs.closedEccentricCones.byteOffset,
      primitiveSpecs.closedEccentricCones.byteOffset + primitiveSpecs.closedEccentricCones.byteCount
    );
    const closedEllipsoidSegmentSlice = buffer.slice(
      primitiveSpecs.closedEllipsoidSegments.byteOffset,
      primitiveSpecs.closedEllipsoidSegments.byteOffset + primitiveSpecs.closedEllipsoidSegments.byteCount
    );
    const closedExtrudedRingSegmentSlice = buffer.slice(
      primitiveSpecs.closedExtrudedRingSegments.byteOffset,
      primitiveSpecs.closedExtrudedRingSegments.byteOffset + primitiveSpecs.closedExtrudedRingSegments.byteCount
    );
    const closedSphericalSegmentSlice = buffer.slice(
      primitiveSpecs.closedSphericalSegments.byteOffset,
      primitiveSpecs.closedSphericalSegments.byteOffset + primitiveSpecs.closedSphericalSegments.byteCount
    );
    const closedTorusSegmentSlice = buffer.slice(
      primitiveSpecs.closedTorusSegments.byteOffset,
      primitiveSpecs.closedTorusSegments.byteOffset + primitiveSpecs.closedTorusSegments.byteCount
    );
    const ellipsoidSlice = buffer.slice(
      primitiveSpecs.ellipsoids.byteOffset,
      primitiveSpecs.ellipsoids.byteOffset + primitiveSpecs.ellipsoids.byteCount
    );
    const extrudedRingSlice = buffer.slice(
      primitiveSpecs.extrudedRings.byteOffset,
      primitiveSpecs.extrudedRings.byteOffset + primitiveSpecs.extrudedRings.byteCount
    );
    const nutSlice = buffer.slice(
      primitiveSpecs.nuts.byteOffset,
      primitiveSpecs.nuts.byteOffset + primitiveSpecs.nuts.byteCount
    );
    const openConeSlice = buffer.slice(
      primitiveSpecs.openCones.byteOffset,
      primitiveSpecs.openCones.byteOffset + primitiveSpecs.openCones.byteCount
    );
    const openCylinderSlice = buffer.slice(
      primitiveSpecs.openCylinders.byteOffset,
      primitiveSpecs.openCylinders.byteOffset + primitiveSpecs.openCylinders.byteCount
    );
    const openEccentricConeSlice = buffer.slice(
      primitiveSpecs.openEccentricCones.byteOffset,
      primitiveSpecs.openEccentricCones.byteOffset + primitiveSpecs.openEccentricCones.byteCount
    );
    const openEllipsoidSegmentSlice = buffer.slice(
      primitiveSpecs.openEllipsoidSegments.byteOffset,
      primitiveSpecs.openEllipsoidSegments.byteOffset + primitiveSpecs.openEllipsoidSegments.byteCount
    );
    const openExtrudedRingSegmentSlice = buffer.slice(
      primitiveSpecs.openExtrudedRingSegments.byteOffset,
      primitiveSpecs.openExtrudedRingSegments.byteOffset + primitiveSpecs.openExtrudedRingSegments.byteCount
    );
    const openSphericalSegmentSlice = buffer.slice(
      primitiveSpecs.openSphericalSegments.byteOffset,
      primitiveSpecs.openSphericalSegments.byteOffset + primitiveSpecs.openSphericalSegments.byteCount
    );
    const openTorusSegmentSlice = buffer.slice(
      primitiveSpecs.openTorusSegments.byteOffset,
      primitiveSpecs.openTorusSegments.byteOffset + primitiveSpecs.openTorusSegments.byteCount
    );
    const ringSlice = buffer.slice(
      primitiveSpecs.rings.byteOffset,
      primitiveSpecs.rings.byteOffset + primitiveSpecs.rings.byteCount
    );
    const sphereSlice = buffer.slice(
      primitiveSpecs.spheres.byteOffset,
      primitiveSpecs.spheres.byteOffset + primitiveSpecs.spheres.byteCount
    );
    const torusSlice = buffer.slice(
      primitiveSpecs.toruses.byteOffset,
      primitiveSpecs.toruses.byteOffset + primitiveSpecs.toruses.byteCount
    );
    const openGeneralCylinderSlice = buffer.slice(
      primitiveSpecs.openGeneralCylinders.byteOffset,
      primitiveSpecs.openGeneralCylinders.byteOffset + primitiveSpecs.openGeneralCylinders.byteCount
    );
    const closedGeneralCylinderSlice = buffer.slice(
      primitiveSpecs.closedGeneralCylinders.byteOffset,
      primitiveSpecs.closedGeneralCylinders.byteOffset + primitiveSpecs.closedGeneralCylinders.byteCount
    );
    const solidOpenGeneralCylinderSlice = buffer.slice(
      primitiveSpecs.solidOpenGeneralCylinders.byteOffset,
      primitiveSpecs.solidOpenGeneralCylinders.byteOffset + primitiveSpecs.solidOpenGeneralCylinders.byteCount
    );
    const solidClosedGeneralCylinderSlice = buffer.slice(
      primitiveSpecs.solidClosedGeneralCylinders.byteOffset,
      primitiveSpecs.solidClosedGeneralCylinders.byteOffset + primitiveSpecs.solidClosedGeneralCylinders.byteCount
    );
    const openGeneralConeSlice = buffer.slice(
      primitiveSpecs.openGeneralCones.byteOffset,
      primitiveSpecs.openGeneralCones.byteOffset + primitiveSpecs.openGeneralCones.byteCount
    );
    const closedGeneralConeSlice = buffer.slice(
      primitiveSpecs.closedGeneralCones.byteOffset,
      primitiveSpecs.closedGeneralCones.byteOffset + primitiveSpecs.closedGeneralCones.byteCount
    );
    const solidOpenGeneralConeSlice = buffer.slice(
      primitiveSpecs.solidOpenGeneralCones.byteOffset,
      primitiveSpecs.solidOpenGeneralCones.byteOffset + primitiveSpecs.solidOpenGeneralCones.byteCount
    );
    const solidClosedGeneralConeSlice = buffer.slice(
      primitiveSpecs.solidClosedGeneralCones.byteOffset,
      primitiveSpecs.solidClosedGeneralCones.byteOffset + primitiveSpecs.solidClosedGeneralCones.byteCount
    );

    const boxOutput = new Uint8Array(getBoxOutputSize(boxSlice));
    const circleOutput = new Uint8Array(
      getCircleOutputSize(
        circleSlice,
        closedConeSlice,
        closedEccentricConeSlice,
        closedCylinderSlice,
        closedEllipsoidSegmentSlice,
        closedSphericalSegmentSlice
      )
    );
    const coneOutput = new Uint8Array(
      getConeOutputSize(
        closedConeSlice,
        openConeSlice,
        openGeneralConeSlice,
        closedGeneralConeSlice,
        solidOpenGeneralConeSlice,
        solidClosedGeneralConeSlice,
        closedCylinderSlice,
        openCylinderSlice,
        closedExtrudedRingSegmentSlice,
        extrudedRingSlice,
        openExtrudedRingSegmentSlice
      )
    );
    const eccentricConeOutput = new Uint8Array(
      getEccentricConeOutputSize(closedEccentricConeSlice, openEccentricConeSlice)
    );
    const ellipsoidSegmentOutput = new Uint8Array(
      getEllipsoidSegmentOutputSize(closedEllipsoidSegmentSlice, ellipsoidSlice, openEllipsoidSegmentSlice)
    );
    const generalCylinderOutput = new Uint8Array(
      getGeneralCylinderOutputSize(
        openGeneralCylinderSlice,
        closedGeneralCylinderSlice,
        solidOpenGeneralCylinderSlice,
        solidClosedGeneralCylinderSlice
      )
    );
    const generalRingOutput = new Uint8Array(
      getGeneralRingOutputSize(
        closedGeneralConeSlice,
        solidOpenGeneralConeSlice,
        solidClosedGeneralConeSlice,
        closedGeneralCylinderSlice,
        solidOpenGeneralCylinderSlice,
        solidClosedGeneralCylinderSlice,
        closedExtrudedRingSegmentSlice,
        extrudedRingSlice,
        openExtrudedRingSegmentSlice,
        ringSlice
      )
    );
    const nutOutput = new Uint8Array(getNutOutputSize(nutSlice));
    const quadOutput = new Uint8Array(getQuadOutputSize(closedExtrudedRingSegmentSlice));
    const sphericalSegmentOutput = new Uint8Array(
      getSphericalSegmentOutputSize(openSphericalSegmentSlice, sphereSlice, closedSphericalSegmentSlice)
    );
    const torusSegmentOutput = new Uint8Array(
      getTorusSegmentOutputSize(torusSlice, closedTorusSegmentSlice, openTorusSegmentSlice)
    );
    const trapeziumOutput = new Uint8Array(
      getTrapeziumOutputSize(solidClosedGeneralConeSlice, solidClosedGeneralCylinderSlice)
    );

    let boxOutputOffset = 0;
    let circleOutputOffset = 0;
    let coneOutputOffset = 0;
    let eccentricConeOutputOffset = 0;
    let ellipsoidSegmentOutputOffset = 0;
    let generalCylinderOutputOffset = 0;
    let generalRingOutputOffset = 0;
    let nutOutputOffset = 0;
    let quadOutputOffset = 0;
    let sphericalSegmentOutputOffset = 0;
    let torusSegmentOutputOffset = 0;
    let trapeziumOutputOffset = 0;

    boxOutputOffset += transformBoxes(boxSlice, boxOutput, boxOutputOffset, boxAttributes);

    circleOutputOffset += transformCircles(circleSlice, circleOutput, circleOutputOffset, circleAttributes);

    const closedConeOutputOffsets = transformClosedCones(
      closedConeSlice,
      coneOutput,
      circleOutput,
      coneOutputOffset,
      circleOutputOffset,
      coneAttributes,
      circleAttributes
    );
    coneOutputOffset += closedConeOutputOffsets[0];
    circleOutputOffset += closedConeOutputOffsets[1];

    coneOutputOffset += transformOpenCones(openConeSlice, coneOutput, coneOutputOffset, coneAttributes);

    const closedEccentricConeOutputOffsets = transformClosedEccentricCones(
      closedEccentricConeSlice,
      eccentricConeOutput,
      circleOutput,
      eccentricConeOutputOffset,
      circleOutputOffset,
      eccentricConeAttributes,
      circleAttributes
    );
    eccentricConeOutputOffset += closedEccentricConeOutputOffsets[0];
    circleOutputOffset += closedEccentricConeOutputOffsets[1];

    eccentricConeOutputOffset += transformOpenEccentricCones(
      openEccentricConeSlice,
      eccentricConeOutput,
      eccentricConeOutputOffset,
      eccentricConeAttributes
    );

    coneOutputOffset += transformOpenGeneralCones(openGeneralConeSlice, coneOutput, coneOutputOffset, coneAttributes);

    const closedGeneralConeOutputOffsets = transformClosedGeneralCones(
      closedGeneralConeSlice,
      coneOutput,
      generalRingOutput,
      coneOutputOffset,
      generalRingOutputOffset,
      coneAttributes,
      generalRingAttributes
    );
    coneOutputOffset += closedGeneralConeOutputOffsets[0];
    generalRingOutputOffset += closedGeneralConeOutputOffsets[1];

    const solidOpenGeneralConesOutputOffsets = transformSolidOpenGeneralCones(
      solidOpenGeneralConeSlice,
      coneOutput,
      generalRingOutput,
      coneOutputOffset,
      generalRingOutputOffset,
      coneAttributes,
      generalRingAttributes
    );
    coneOutputOffset += solidOpenGeneralConesOutputOffsets[0];
    generalRingOutputOffset += solidOpenGeneralConesOutputOffsets[1];

    const solidClosedGeneralConesOutputOffsets = transformSolidClosedGeneralCones(
      solidClosedGeneralConeSlice,
      coneOutput,
      generalRingOutput,
      trapeziumOutput,
      coneOutputOffset,
      generalRingOutputOffset,
      trapeziumOutputOffset,
      coneAttributes,
      generalRingAttributes,
      trapeziumAttributes
    );
    coneOutputOffset += solidClosedGeneralConesOutputOffsets[0];
    generalRingOutputOffset += solidClosedGeneralConesOutputOffsets[1];
    trapeziumOutputOffset += solidClosedGeneralConesOutputOffsets[2];

    const closedCylinderOutputOffsets = transformClosedCylinders(
      closedCylinderSlice,
      coneOutput,
      circleOutput,
      coneOutputOffset,
      circleOutputOffset,
      coneAttributes,
      circleAttributes
    );
    coneOutputOffset += closedCylinderOutputOffsets[0];
    circleOutputOffset += closedCylinderOutputOffsets[1];

    coneOutputOffset += transformOpenCylinders(openCylinderSlice, coneOutput, coneOutputOffset, coneAttributes);

    generalCylinderOutputOffset += transformOpenGeneralCylinders(
      openGeneralCylinderSlice,
      generalCylinderOutput,
      generalCylinderOutputOffset,
      generalCylinderAttributes
    );

    const closedGeneralCylinderOutputOffsets = transformClosedGeneralCylinders(
      closedGeneralCylinderSlice,
      generalCylinderOutput,
      generalRingOutput,
      generalCylinderOutputOffset,
      generalRingOutputOffset,
      generalCylinderAttributes,
      generalRingAttributes
    );

    generalCylinderOutputOffset += closedGeneralCylinderOutputOffsets[0];
    generalRingOutputOffset += closedGeneralCylinderOutputOffsets[1];

    const solidOpenGeneralCylinderOutputOffsets = transformSolidOpenGeneralCylinders(
      solidOpenGeneralCylinderSlice,
      generalCylinderOutput,
      generalRingOutput,
      generalCylinderOutputOffset,
      generalRingOutputOffset,
      generalCylinderAttributes,
      generalRingAttributes
    );

    generalCylinderOutputOffset += solidOpenGeneralCylinderOutputOffsets[0];
    generalRingOutputOffset += solidOpenGeneralCylinderOutputOffsets[1];

    const solidClosedGeneralCylinderOutputOffsets = transformSolidClosedGeneralCylinders(
      solidClosedGeneralCylinderSlice,
      generalCylinderOutput,
      generalRingOutput,
      trapeziumOutput,
      generalCylinderOutputOffset,
      generalRingOutputOffset,
      trapeziumOutputOffset,
      generalCylinderAttributes,
      generalRingAttributes,
      trapeziumAttributes
    );
    generalCylinderOutputOffset += solidClosedGeneralCylinderOutputOffsets[0];
    generalRingOutputOffset += solidClosedGeneralCylinderOutputOffsets[1];
    trapeziumOutputOffset += solidClosedGeneralCylinderOutputOffsets[2];

    const closedEllipsoidSegmentOutputOffsets = transformClosedEllipsoidSegments(
      closedEllipsoidSegmentSlice,
      ellipsoidSegmentOutput,
      circleOutput,
      ellipsoidSegmentOutputOffset,
      circleOutputOffset,
      ellipsoidSegmentAttributes,
      circleAttributes
    );
    ellipsoidSegmentOutputOffset += closedEllipsoidSegmentOutputOffsets[0];
    circleOutputOffset += closedEllipsoidSegmentOutputOffsets[1];

    ellipsoidSegmentOutputOffset += transformEllipsoids(
      ellipsoidSlice,
      ellipsoidSegmentOutput,
      ellipsoidSegmentOutputOffset,
      ellipsoidSegmentAttributes
    );

    ellipsoidSegmentOutputOffset += transformOpenEllipsoidSegments(
      openEllipsoidSegmentSlice,
      ellipsoidSegmentOutput,
      ellipsoidSegmentOutputOffset,
      ellipsoidSegmentAttributes
    );

    nutOutputOffset += transformNuts(nutSlice, nutOutput, nutOutputOffset, nutAttributes);

    const closedExtrudedRingSegmentOutputOffsets = transformClosedExtrudedRingSegments(
      closedExtrudedRingSegmentSlice,
      generalRingOutput,
      coneOutput,
      quadOutput,
      generalRingOutputOffset,
      coneOutputOffset,
      quadOutputOffset,
      generalRingAttributes,
      coneAttributes,
      quadAttributes
    );
    generalRingOutputOffset += closedExtrudedRingSegmentOutputOffsets[0];
    coneOutputOffset += closedExtrudedRingSegmentOutputOffsets[1];
    quadOutputOffset += closedExtrudedRingSegmentOutputOffsets[2];

    const extrudedRingOutputOffsets = transformExtrudedRings(
      extrudedRingSlice,
      generalRingOutput,
      coneOutput,
      generalRingOutputOffset,
      coneOutputOffset,
      generalRingAttributes,
      coneAttributes
    );
    generalRingOutputOffset += extrudedRingOutputOffsets[0];
    coneOutputOffset += extrudedRingOutputOffsets[1];

    const openExtrudedRingSegmentOffsets = transformOpenExtrudedRingSegments(
      openExtrudedRingSegmentSlice,
      generalRingOutput,
      coneOutput,
      generalRingOutputOffset,
      coneOutputOffset,
      generalRingAttributes,
      coneAttributes
    );
    generalRingOutputOffset += openExtrudedRingSegmentOffsets[0];
    coneOutputOffset += openExtrudedRingSegmentOffsets[1];

    generalRingOutputOffset += transformRings(
      ringSlice,
      generalRingOutput,
      generalRingOutputOffset,
      generalRingAttributes
    );

    sphericalSegmentOutputOffset += transformOpenSphericalSegments(
      openSphericalSegmentSlice,
      sphericalSegmentOutput,
      sphericalSegmentOutputOffset,
      sphericalSegmentAttributes
    );

    sphericalSegmentOutputOffset += transformSpheres(
      sphereSlice,
      sphericalSegmentOutput,
      sphericalSegmentOutputOffset,
      sphericalSegmentAttributes
    );

    const closedSphericalSegmentOffsets = transformClosedSphericalSegments(
      closedSphericalSegmentSlice,
      sphericalSegmentOutput,
      circleOutput,
      sphericalSegmentOutputOffset,
      circleOutputOffset,
      sphericalSegmentAttributes,
      circleAttributes
    );
    sphericalSegmentOutputOffset += closedSphericalSegmentOffsets[0];
    circleOutputOffset += closedSphericalSegmentOffsets[1];

    torusSegmentOutputOffset += transformToruses(
      torusSlice,
      torusSegmentOutput,
      torusSegmentOutputOffset,
      torusSegmentAttributes
    );

    torusSegmentOutputOffset += transformClosedTorusSegments(
      closedTorusSegmentSlice,
      torusSegmentOutput,
      torusSegmentOutputOffset,
      torusSegmentAttributes
    );

    torusSegmentOutputOffset += transformOpenTorusSegments(
      openTorusSegmentSlice,
      torusSegmentOutput,
      torusSegmentOutputOffset,
      torusSegmentAttributes
    );

    const res: ParsedPrimitives = {
      boxCollection: boxOutput,
      boxAttributes,
      circleCollection: circleOutput,
      circleAttributes,
      coneCollection: coneOutput,
      coneAttributes,
      eccentricConeCollection: eccentricConeOutput,
      eccentricConeAttributes,
      ellipsoidSegmentCollection: ellipsoidSegmentOutput,
      ellipsoidSegmentAttributes,
      generalCylinderCollection: generalCylinderOutput,
      generalCylinderAttributes,
      generalRingCollection: generalRingOutput,
      generalRingAttributes,
      nutCollection: nutOutput,
      nutAttributes,
      quadCollection: quadOutput,
      quadAttributes,
      sphericalSegmentCollection: sphericalSegmentOutput,
      sphericalSegmentAttributes,
      torusSegmentCollection: torusSegmentOutput,
      torusSegmentAttributes,
      trapeziumCollection: trapeziumOutput,
      trapeziumAttributes
    };

    return res;
  }

  private addSpatialAttributes(original: Float32Array, inputVerts: Float32Array): Float32Array {
    const newVerts = new Float32Array(original.length + inputVerts.length);

    newVerts.set(original);

    for (let i = 0; i < Math.round(inputVerts.length / 3); i++) {
      // Components must be reordered as we use a different coordinate system than glTF

      newVerts[original.length + 3 * i + 0] = -inputVerts[3 * i + 0];

      newVerts[original.length + 3 * i + 1] = inputVerts[3 * i + 2];
      newVerts[original.length + 3 * i + 2] = inputVerts[3 * i + 1];
    }

    return newVerts;
  }

  private addIndices(original: Uint32Array, inputIndices: Uint32Array, originalOffset: number): Uint32Array {
    const newIndices = new Uint32Array(original.length + inputIndices.length);

    newIndices.set(original);

    for (let i = 0; i < inputIndices.length; i++) {
      newIndices[original.length + i] = inputIndices[i] + originalOffset;
    }

    return newIndices;
  }
}
