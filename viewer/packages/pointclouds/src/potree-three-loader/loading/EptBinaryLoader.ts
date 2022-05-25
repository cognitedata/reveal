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
import EptDecoderWorker from '../workers/eptBinaryDecoder.worker';
import { ParseCommand, ObjectsCommand } from '../workers/eptBinaryDecoder.worker';

import { ParsedEptData, EptInputData } from '../workers/parseEpt';

import { StyledObjectInfo } from '../../styling/StyledObjectInfo';

export class EptBinaryLoader implements ILoader {
  private readonly _dataLoader: ModelDataProvider;
  private readonly _styledObjectInfo: StyledObjectInfo | undefined;

  static readonly WORKER_POOL = new WorkerPool(32, EptDecoderWorker);

  extension(): string {
    return '.bin';
  }

  constructor(dataLoader: ModelDataProvider, styledObjectInfo?: StyledObjectInfo | undefined) {
    this._dataLoader = dataLoader;
    this._styledObjectInfo = styledObjectInfo;
  }

  async load(node: PointCloudEptGeometryNode): Promise<void> {
    if (node.loaded) return;

    const fullFileName = node.fileName() + this.extension();
    const data = await this._dataLoader.getBinaryFile(node.baseUrl(), fullFileName);
    return this.parse(node, data);
  }

  async parse(node: PointCloudEptGeometryNode, data: ArrayBuffer): Promise<void> {
    const autoTerminatingWorker = await EptBinaryLoader.WORKER_POOL.getWorker();

    return new Promise<void>(res => {
      autoTerminatingWorker.worker.onmessage = function (e: { data: ParsedEptData }) {
        const g = new THREE.BufferGeometry();
        const numPoints = e.data.numPoints;

        function addAttributeIfPresent<TypedArray extends ArrayLike<number>>(
          typedArrayConstructor: { new (data: ArrayBuffer): TypedArray },
          name: string,
          componentCount: number,
          data?: ArrayBuffer | undefined,
          normalized: boolean = false
        ): void {
          if (data) {
            const typedArray = new typedArrayConstructor(data);
            g.setAttribute(name, new THREE.BufferAttribute(typedArray, componentCount, normalized));
          }
        }

        addAttributeIfPresent<Float32Array>(Float32Array, 'position', 3, e.data.position);
        addAttributeIfPresent<Uint8Array>(Uint8Array, 'indices', 4, e.data.indices);
        addAttributeIfPresent<Uint8Array>(Uint8Array, 'color', 4, e.data.color, true);
        addAttributeIfPresent<Float32Array>(Float32Array, 'intensity', 1, e.data.intensity);
        addAttributeIfPresent<Uint8Array>(Uint8Array, 'classification', 1, e.data.classification);
        addAttributeIfPresent<Uint8Array>(Uint8Array, 'return number', 1, e.data.returnNumber);
        addAttributeIfPresent<Uint8Array>(Uint8Array, 'number of returns', 1, e.data.numberOfReturns);
        addAttributeIfPresent<Uint16Array>(Uint16Array, 'source id', 1, e.data.pointSourceId);
        addAttributeIfPresent<Uint16Array>(Uint16Array, 'objectId', 1, e.data.objectId);

        g.attributes.indices.normalized = true;

        const tightBoundingBox = new THREE.Box3(
          new THREE.Vector3().fromArray(e.data.tightBoundingBox.min),
          new THREE.Vector3().fromArray(e.data.tightBoundingBox.max)
        );

        node.doneLoading(g, tightBoundingBox, numPoints, new THREE.Vector3(...e.data.mean));

        EptBinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
        res();
      };

      const toArray = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];
      const eptData: EptInputData = {
        buffer: data,
        schema: node.ept.schema,
        scale: node.ept.eptScale,
        offset: node.ept.eptOffset,
        mins: toArray(node.key.b.min)
      };

      if (this._styledObjectInfo) {
        const offsetVec = node.boundingBox.min;

        const objectMessage: ObjectsCommand = {
          type: 'objects',
          objects: this._styledObjectInfo.styledObjects,
          pointOffset: [offsetVec.x, offsetVec.y, offsetVec.z] as [number, number, number]
        };

        autoTerminatingWorker.worker.postMessage(objectMessage);
      }

      const parseMessage: ParseCommand = {
        type: 'parse',
        data: eptData
      };

      autoTerminatingWorker.worker.postMessage(parseMessage, [parseMessage.data.buffer]);
    });
  }
}
