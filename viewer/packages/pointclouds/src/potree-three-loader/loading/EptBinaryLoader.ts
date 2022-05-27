/*
 * Adapted from Potree:
 * https://github.com/potree/potree/blob/develop/src/loader/ept/BinaryLoader.js
 * License in LICENSE.potree
 */

import * as THREE from 'three';

import { AutoTerminatingWorker, WorkerPool } from '../utils/WorkerPool';
import { ILoader } from './ILoader';
import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import EptDecoderWorker from '../workers/eptBinaryDecoder.worker';
import { ParseCommand, ObjectsCommand } from '../workers/eptBinaryDecoder.worker';

import { ParsedEptData, EptInputData } from '../workers/parseEpt';

import { StyledObjectInfo } from '../../styling/StyledObjectInfo';

import { fromThreeVector3 } from '@reveal/utilities';

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
        const geometry = createGeometryFromEptData(e.data);

        const tightBoundingBox = createTightBoundingBox(e.data);

        const numPoints = e.data.numPoints;
        node.doneLoading(geometry, tightBoundingBox, numPoints, new THREE.Vector3(...e.data.mean));

        EptBinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
        res();
      };

      if (this._styledObjectInfo) {
        postStyledObjectInfo(autoTerminatingWorker,
                             node,
                             this._styledObjectInfo);
      }

      const eptData: EptInputData = {
        buffer: data,
        schema: node.ept.schema,
        scale: node.ept.eptScale,
        offset: node.ept.eptOffset,
        mins: fromThreeVector3(node.key.b.min)
      };

      postParseCommand(autoTerminatingWorker, eptData);
    });
  }
}

function createTightBoundingBox(data: ParsedEptData): THREE.Box3 {
  return new THREE.Box3(
    new THREE.Vector3().fromArray(data.tightBoundingBox.min),
    new THREE.Vector3().fromArray(data.tightBoundingBox.max)
  );
}

function postParseCommand(autoTerminatingWorker: AutoTerminatingWorker,
                          data: EptInputData) {

      const parseMessage: ParseCommand = {
        type: 'parse',
        data
      };

      autoTerminatingWorker.worker.postMessage(parseMessage, [parseMessage.data.buffer]);
}

function postStyledObjectInfo(autoTerminatingWorker: AutoTerminatingWorker,
                              node: PointCloudEptGeometryNode,
                              styledObjectInfo: StyledObjectInfo): void {

  const offsetVec = node.boundingBox.min;

  const objectMessage: ObjectsCommand = {
    type: 'objects',
    objects: styledObjectInfo.styledObjects,
    pointOffset: [offsetVec.x, offsetVec.y, offsetVec.z] as [number, number, number]
  };

  autoTerminatingWorker.worker.postMessage(objectMessage);
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
  addAttributeIfPresent<Uint32Array>(Uint32Array, 'indices', 1, data.indices);
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
