/*!
 * Copyright 2021 Cognite AS
 */

import { WorkerPool } from '../../../utilities/workers/WorkerPool';
import { ParseSectorResult, ParseCtmResult, RevealParserWorker } from '@cognite/reveal-parser-worker';
import { SectorQuads } from '../rendering/types';

import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import * as THREE from 'three';

export interface ParseGltfResult {
  indices: Uint32Array;
  vertices: Float32Array;
  normals: Float32Array | undefined;
  gltf: GLTF;
  meshNameToOffsetCountMap: Map<string, { triangleOffset: number, triangleCount: number }>;
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
      
      console.log("Trying to load GLTF file " + fileName);
      loader.load(
        fileName,
        (gltf: GLTF) => {
      
          console.dir("Received result for file " + fileName + "!");
          let foundGeometry = false;

          let allVertices = new Float32Array();
          let allIndices = new Uint32Array();
          let allNormals = new Float32Array();

          const meshNameToOffsetCount = new Map<string, { triangleOffset: number, triangleCount: number }>();

          let meshes: THREE.Mesh<any, any>[] = [];
          

          gltf.scene.traverse((obj: THREE.Object3D) => {
            if (obj instanceof THREE.Mesh) {
              foundGeometry = true;
              meshes.push(obj as THREE.Mesh);

              console.log((obj as THREE.Mesh).name + ' is a mesh name');
            }
          });

          
          if (!foundGeometry) {
            reject('Could not find any geometry');
          }

          meshes.sort((mesh0, mesh1) => mesh0.name < mesh1.name ? -1 : 1);

          for (const mesh of meshes) {

            const triangleStart = allIndices.length / 3;
            
            // Starting index for this mesh inside the whole vertex list
            const startIndex = allVertices.length / 3;
            allVertices = this.addSpatialAttributes(allVertices, mesh.geometry.attributes['position'].array);
            allIndices = this.addIndices(allIndices, mesh.geometry.index.array, startIndex);

            const triangleCount = allIndices.length / 3 - triangleStart;

            console.log("Mesh " + mesh.name + " had count = " + triangleCount + " and offset = " + triangleStart);

            // console.log("Number of vertices in mesh = " + mesh.geometry.attributes['position'].array.length);
            
            if ('normals' in mesh.geometry.attributes) {
              allNormals = this.addSpatialAttributes(allNormals, mesh.geometry.attributes['normals'].array);
            }

            meshNameToOffsetCount.set(mesh.name, { triangleOffset: triangleStart, triangleCount: triangleCount });
          }

          // If attributes differ in length, set normals to null
          let finalNormals = allNormals.length == allVertices.length ? allNormals : undefined;

          console.dir("GLTF scene: ");
          console.dir(gltf.scene.toJSON());
          
          resolve({
            vertices: allVertices,
            indices: allIndices,
            normals: finalNormals,
            meshNameToOffsetCountMap: meshNameToOffsetCount,
            gltf: gltf,
          });
        },
        () => { /* console.dir("Progress"); console.dir(progress); */ },
        () => {
          throw new Error('Error when loading GLTF.');
        }
      );
    });
  }

  private addSpatialAttributes(original: Float32Array, inputVerts: Float32Array): Float32Array {
    
    const newVerts = new Float32Array(original.length + inputVerts.length);

    newVerts.set(original);

    for (let i = 0; i < Math.round(inputVerts.length / 3); i++) {
      // Components must be reordered as we use a different coordinate system than glTF
      
      newVerts[original.length + 3 * i + 0] = - inputVerts[3 * i + 0];

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
