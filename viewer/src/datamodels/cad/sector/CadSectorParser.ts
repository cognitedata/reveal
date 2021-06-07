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
}

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;
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

  private async parseGltfInner(fileName: string): Promise<ParseGltfResult> {
    return new Promise<ParseGltfResult>((resolve, reject) => {
      const loader = new GLTFLoader();

      const dracoLoader = new DRACOLoader();
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        fileName,
        (gltf: GLTF) => {
          let foundGeometry = false;
          gltf.scene.traverse((obj: THREE.Object3D) => {
            if (obj instanceof THREE.Mesh) {
              foundGeometry = true;
              resolve({
                vertices: this.reorderVertices(obj.geometry.attributes['position'].array),
                indices: obj.geometry.index.array,
                normals: obj.geometry.attributes['normal']?.array
              });
            }
          });

          if (!foundGeometry) {
            reject('Could not find any geometry');
          }
        },
        () => {},
        () => {
          throw new Error('Error when loading GLTF.');
        }
      );
    });
  }

  private reorderVertices(verts: Float32Array): Float32Array {
    const newVerts = new Float32Array(verts.length);

    for (let i = 0; i < Math.floor(verts.length); i++) {
      newVerts[3 * i + 0] = -verts[3 * i + 0];

      newVerts[3 * i + 1] = verts[3 * i + 2];
      newVerts[3 * i + 2] = verts[3 * i + 1];
    }

    return newVerts;
  }
}
