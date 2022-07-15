/*
 * Adapted from Potree:
 * https://github.com/potree/potree/blob/develop/src/loader/ept/BinaryLoader.js
 * License in LICENSE.potree
 */

import * as THREE from 'three';

import { WorkerPool } from '../utils/WorkerPool';
import { ILoader } from './ILoader';
import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';

import * as EptDecoderWorker from '../workers/eptBinaryDecoder.worker';

import { ParsedEptData, EptInputData } from '../workers/parseEpt';

import { fromThreeVector3, setupTransferableMethodsOnMain } from '@reveal/utilities';
import { RawStylableObject } from '../../styling/StylableObject';
import { PointCloudObjectProvider } from '../../styling/PointCloudObjectProvider';
import { stylableObjectToRaw } from '../../styling/StylableObject';

export class EptBinaryLoader implements ILoader {
  private readonly _dataLoader: ModelDataProvider;
  private readonly _stylableObjectsWithBoundingBox: {
    object: RawStylableObject;
    box: THREE.Box3;
  }[];

  static readonly WORKER_POOL = new WorkerPool(32, EptDecoderWorker as unknown as new () => Worker);

  extension(): string {
    return '.bin';
  }

  constructor(dataLoader: ModelDataProvider, stylableObjects: PointCloudObjectProvider) {
    this._dataLoader = dataLoader;
    this._stylableObjectsWithBoundingBox = stylableObjects.annotations.map(a => {
      return {
        object: stylableObjectToRaw(a.stylableObject),
        box: a.stylableObject.shape.createBoundingBox()
      };
    });
  }

  async load(node: PointCloudEptGeometryNode): Promise<void> {
    if (node.loaded) return;

    const fullFileName = node.fileName() + this.extension();
    const data = await this._dataLoader.getBinaryFile(node.baseUrl(), fullFileName);

    const parsedData = await this.parse(node, data);
    this.finalizeLoading(parsedData, node);
  }

  private finalizeLoading(parsedData: ParsedEptData, node: PointCloudEptGeometryNode) {
    const geometry = createGeometryFromEptData(parsedData);

    const tightBoundingBox = createTightBoundingBox(parsedData);

    const numPoints = parsedData.numPoints;
    node.doneLoading(geometry, tightBoundingBox, numPoints, new THREE.Vector3(...parsedData.mean));
  }

  async parse(node: PointCloudEptGeometryNode, data: ArrayBuffer): Promise<ParsedEptData> {
    const autoTerminatingWorker = await EptBinaryLoader.WORKER_POOL.getWorker();
    const eptDecoderWorker = autoTerminatingWorker.worker as unknown as typeof EptDecoderWorker;
    const eptData: EptInputData = {
      buffer: data,
      schema: node.ept.schema,
      scale: node.ept.eptScale,
      offset: node.ept.eptOffset,
      mins: fromThreeVector3(node.key.b.min)
    };

    setupTransferableMethodsOnMain(autoTerminatingWorker.worker, {
      parse: {
        pickTransferablesFromParams: (params: any) => {
          return params.buffer;
        }
      }
    });

      const relevantStylableObjects = this._stylableObjectsWithBoundingBox
        .filter(p => p.box.intersectsBox(node.getBoundingBox()))
        .map(p => p.object);

    const result = await eptDecoderWorker.parse(eptData, relevantStylableObjects, node.boundingBox.min.toArray());
    EptBinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
    return result;
  }
}

function createTightBoundingBox(data: ParsedEptData): THREE.Box3 {
  return new THREE.Box3(
    new THREE.Vector3().fromArray(data.tightBoundingBox.min),
    new THREE.Vector3().fromArray(data.tightBoundingBox.max)
  );
}

function createGeometryFromEptData(data: ParsedEptData): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  function addAttributeIfPresent<TypedArray extends ArrayLike<number>>(
    typedArrayConstructor: { new (data: ArrayBuffer): TypedArray },
    name: string,
    componentCount: number,
    data?: ArrayBuffer | undefined,
    normalized: boolean = false
  ): void {
    if (data) {
      const typedArray = new typedArrayConstructor(data);
      geometry.setAttribute(name, new THREE.BufferAttribute(typedArray, componentCount, normalized));
    }
  }

  addAttributeIfPresent<Float32Array>(Float32Array, 'position', 3, data.position);
  addAttributeIfPresent<Uint8Array>(Uint8Array, 'indices', 4, data.indices);
  addAttributeIfPresent<Uint8Array>(Uint8Array, 'color', 4, data.color, true);
  addAttributeIfPresent<Float32Array>(Float32Array, 'intensity', 1, data.intensity);
  addAttributeIfPresent<Uint8Array>(Uint8Array, 'classification', 1, data.classification);
  addAttributeIfPresent<Uint8Array>(Uint8Array, 'return number', 1, data.returnNumber);
  addAttributeIfPresent<Uint8Array>(Uint8Array, 'number of returns', 1, data.numberOfReturns);
  addAttributeIfPresent<Uint16Array>(Uint16Array, 'source id', 1, data.pointSourceId);
  addAttributeIfPresent<Uint16Array>(Uint16Array, 'objectId', 1, data.objectId);

  geometry.attributes.indices.normalized = true;

  return geometry;
}
