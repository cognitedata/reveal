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
import PointObjectAssignmentWorker, { PointToObjectAssignmentCommand, PointToObjectAssignmentResult } from '../workers/pointToObjectAssigner.worker';
import { ParseCommand } from '../workers/eptBinaryDecoder.worker';

import { ParsedEptData, EptInputData } from '../workers/parseEpt';

import { fromThreeVector3 } from '@reveal/utilities';
import { RawStylableObject } from '../../styling/StylableObject';
import { PointCloudObjectProvider } from '../../styling/PointCloudObjectProvider';
import { stylableObjectToRaw } from '../../styling/StylableObject';

export class EptBinaryLoader implements ILoader {
  private readonly _dataLoader: ModelDataProvider;
  private readonly _stylableObjectsWithBoundingBox: {
    object: RawStylableObject;
    box: THREE.Box3;
  }[];

  static readonly EPT_DECODER_WORKER_POOL = new WorkerPool(32, EptDecoderWorker);
  static readonly POINT_OBJECT_ASSIGNMENT_WORKER_POOL = new WorkerPool(32, PointObjectAssignmentWorker);

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

  async assignPointsToObjects(node: PointCloudEptGeometryNode, geometry: THREE.BufferGeometry): Promise<void> {
    const positionBuffer = new Float32Array(geometry.getAttribute('position').array);
    const autoTerminatingWorker = await EptBinaryLoader.POINT_OBJECT_ASSIGNMENT_WORKER_POOL.getWorker();

    const relevantStylableObjects = this._stylableObjectsWithBoundingBox
      .filter(p => p.box.intersectsBox(node.boundingBox))
      .map(p => p.object);

    const positionBufferCopy = positionBuffer.slice();

    return new Promise<void>(res => {
      console.time('Running point assignment worker for ' + node.name);
      autoTerminatingWorker.worker.onmessage = (e: { data: PointToObjectAssignmentResult }) => {
        EptBinaryLoader.POINT_OBJECT_ASSIGNMENT_WORKER_POOL.releaseWorker(autoTerminatingWorker);

        const objectId = new Uint16Array(e.data.objectIdBuffer);
        geometry.setAttribute('objectId', new THREE.BufferAttribute(objectId, 1));

        console.timeEnd('Running point assignment worker for ' + node.name);
        console.log(`Assigned ${positionBuffer.length / 3} points to ${relevantStylableObjects.length} objects`);
        res();
      };

      const assignmentCommand: PointToObjectAssignmentCommand = {
        positionBuffer: positionBufferCopy,
        objectList: relevantStylableObjects,
        pointOffset: node.boundingBox.min.toArray()
      };

      autoTerminatingWorker.worker.postMessage(assignmentCommand, [positionBufferCopy.buffer]);
    });
  }

  private finalizeLoading(parsedData: ParsedEptData, node: PointCloudEptGeometryNode): THREE.BufferGeometry {
    const geometry = createGeometryFromEptData(parsedData);

    const tightBoundingBox = createTightBoundingBox(parsedData);

    const numPoints = parsedData.numPoints;
    node.doneLoading(geometry, tightBoundingBox, numPoints, new THREE.Vector3(...parsedData.mean));
    return geometry;
  }

  async parse(node: PointCloudEptGeometryNode, data: ArrayBuffer): Promise<ParsedEptData> {
    const autoTerminatingWorker = await EptBinaryLoader.EPT_DECODER_WORKER_POOL.getWorker();

    return new Promise<ParsedEptData>(res => {
      autoTerminatingWorker.worker.onmessage = (e: { data: ParsedEptData }) => {
        EptBinaryLoader.EPT_DECODER_WORKER_POOL.releaseWorker(autoTerminatingWorker);
        res(e.data);
      };

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

function postParseCommand(autoTerminatingWorker: AutoTerminatingWorker, data: EptInputData) {
  const parseMessage: ParseCommand = {
    type: 'parse',
    data
  };

  autoTerminatingWorker.worker.postMessage(parseMessage, [parseMessage.data.buffer]);
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

  geometry.setAttribute('objectId', new THREE.BufferAttribute(new Uint16Array(new ArrayBuffer(data.position.byteLength)), 1));

  geometry.attributes.indices.normalized = true;

  return geometry;
}
