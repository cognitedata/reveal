/*
 * Adapted from Potree:
 * https://github.com/potree/potree/blob/develop/src/loader/ept/BinaryLoader.js
 * License in LICENSE.potree
 */

import type { TypedArray } from 'three';
import { Box3, BufferAttribute, BufferGeometry, Vector3 } from 'three';

import { WorkerPool } from '../utils/WorkerPool';
import type { ILoader } from './ILoader';
import type { ModelDataProvider, SerializableStylableObject, StylableObject } from '@reveal/data-providers';
import { DMModelIdentifier } from '@reveal/data-providers';
import { SignedUrlRefresher } from '@reveal/data-providers/src/utilities/signedUrlRefresh';
import type { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import EptDecoderWorker from '../workers/eptBinaryDecoder.worker?worker&inline';

import * as Comlink from 'comlink';

import type { ParsedEptData, EptInputData } from '../workers/types';

import { decomposeStylableObjects } from '../../decomposeStylableObjects';

import { fromThreeVector3 } from '@reveal/utilities';
import { MetricsLogger } from '@reveal/metrics';
import type { EptBinaryDecoderWorker } from '../workers/eptBinaryDecoder.worker';

export class EptBinaryLoader implements ILoader {
  private readonly _dataFileProvider: ModelDataProvider;
  private readonly _stylableObjectsWithBox: [SerializableStylableObject, Box3][];
  readonly signedUrlRefresher: SignedUrlRefresher;

  static readonly WORKER_POOL: WorkerPool<Worker> = new WorkerPool(8, EptDecoderWorker);

  extension(): string {
    return '.bin';
  }

  constructor(dataLoader: ModelDataProvider, stylableObjects: StylableObject[]) {
    this._dataFileProvider = dataLoader;
    this.signedUrlRefresher = new SignedUrlRefresher(dataLoader);
    this._stylableObjectsWithBox = decomposeStylableObjects(stylableObjects).map(obj => {
      const serializableShape = obj.shape.getSerializableShape();

      const boundingBox = obj.shape.createBoundingBox();

      return [{ shape: serializableShape, objectId: obj.objectId }, boundingBox];
    });
  }

  async getBinaryFile(node: PointCloudEptGeometryNode): Promise<ArrayBuffer> {
    if (node.modelIdentifier instanceof DMModelIdentifier) {
      const signedUrl = await this.resolveSignedUrl(node);
      if (signedUrl !== undefined) {
        const filePath = `ept-data/${node.fileName()}${this.extension()}`;
        return this.signedUrlRefresher.fetchWithRefresh({
          currentSignedUrl: signedUrl,
          signedFilesBaseUrl: node.signedFilesBaseUrl,
          modelIdentifier: node.modelIdentifier,
          fileName: filePath,
          fetchFn: url => this._dataFileProvider.getBinaryFile('', url),
          onUrlRefreshed: item => {
            node.signedUrl = item.signedUrl;
            node.updateSignedFileItem(item);
          }
        });
      }
    }
    const fullFileName = node.fileName() + this.extension();
    return this._dataFileProvider.getBinaryFile(node.baseUrl(), fullFileName);
  }

  private async resolveSignedUrl(node: PointCloudEptGeometryNode): Promise<string | undefined> {
    if (node.signedUrl !== undefined) {
      return node.signedUrl;
    }
    // Re-check the preloaded signed-files list in case it was populated in the background
    // after node construction.
    const preloadUrl = node.findBinarySignedUrlInPreload();
    if (preloadUrl !== undefined) {
      node.signedUrl = preloadUrl;
      return preloadUrl;
    }
    if (!node.signedFilesBaseUrl || !this._dataFileProvider.getFileUrlsForModel) {
      return undefined;
    }
    const fileName = node.fileName() + this.extension();
    const filePath = `ept-data/${fileName}`;
    const items = await this._dataFileProvider.getFileUrlsForModel(
      node.signedFilesBaseUrl,
      node.modelIdentifier,
      filePath
    );
    const found = items.find(
      item => item.fileName === fileName || item.fileName === filePath || item.fileName.endsWith('/' + fileName)
    );
    if (found !== undefined) {
      node.signedUrl = found.signedUrl;
    }
    return found?.signedUrl;
  }

  async load(node: PointCloudEptGeometryNode): Promise<void> {
    if (node.loaded) return;

    let data: ArrayBuffer = new ArrayBuffer(0);
    // Skip loading sectors if number of points is zero.
    if (node.getNumPoints() !== 0) {
      try {
        data = await this.getBinaryFile(node);
      } catch (error) {
        MetricsLogger.trackError(error as Error, { moduleName: 'EptBinaryLoader', methodName: 'load' });
        node.markAsNotLoading();
        return;
      }
    }

    const parsedResultOrError = await this.parse(node, data);

    if (!(parsedResultOrError as any).position) {
      // Is an error
      const error = parsedResultOrError as Error;
      MetricsLogger.trackError(error, { moduleName: 'EptBinaryLoader', methodName: 'load' });

      node.markAsNotLoading();

      return;
    }

    this.finalizeLoading(parsedResultOrError as ParsedEptData, node);
  }

  private finalizeLoading(parsedData: ParsedEptData, node: PointCloudEptGeometryNode) {
    const geometry = createGeometryFromEptData(parsedData);

    const tightBoundingBox = createTightBoundingBox(parsedData);

    const numPoints = parsedData.numPoints;
    node.doneLoading(geometry, tightBoundingBox, numPoints, new Vector3(...parsedData.mean));
  }

  async parse(node: PointCloudEptGeometryNode, data: ArrayBuffer): Promise<ParsedEptData | Error> {
    const autoTerminatingWorker = await EptBinaryLoader.WORKER_POOL.getWorker();
    const eptDecoderWorker = autoTerminatingWorker.getComlinkProxy<EptBinaryDecoderWorker>();
    const eptData: EptInputData = {
      buffer: data,
      schema: node.ept.schema,
      scale: node.ept.eptScale.toArray(),
      offset: node.ept.eptOffset.toArray(),
      mins: fromThreeVector3(node.key.b.min)
    };

    const relevantObjects = this._stylableObjectsWithBox
      .filter(objAndBox => objAndBox[1].intersectsBox(node.boundingBox))
      .map(objAndBox => objAndBox[0]);

    try {
      const result = await eptDecoderWorker(
        Comlink.transfer(eptData, [eptData.buffer]),
        relevantObjects,
        node.boundingBox.min.toArray(),
        {
          min: node.boundingBox.min.toArray(),
          max: node.boundingBox.max.toArray()
        }
      );
      return result;
    } catch (err) {
      return err as Error;
    } finally {
      EptBinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
    }
  }
}

function createTightBoundingBox(data: ParsedEptData): Box3 {
  return new Box3(
    new Vector3().fromArray(data.tightBoundingBox.min),
    new Vector3().fromArray(data.tightBoundingBox.max)
  );
}

function createGeometryFromEptData(data: ParsedEptData): BufferGeometry {
  const geometry = new BufferGeometry();

  function addAttributeIfPresent(
    typedArrayConstructor: { new (data: ArrayBuffer): TypedArray },
    name: string,
    componentCount: number,
    data?: ArrayBuffer | undefined,
    normalized: boolean = false
  ): void {
    if (data) {
      const typedArray = new typedArrayConstructor(data);
      geometry.setAttribute(name, new BufferAttribute(typedArray, componentCount, normalized));
    }
  }

  addAttributeIfPresent(Float32Array, 'position', 3, data.position);
  addAttributeIfPresent(Uint8Array, 'indices', 4, data.indices);
  addAttributeIfPresent(Uint8Array, 'color', 4, data.color, true);
  addAttributeIfPresent(Float32Array, 'intensity', 1, data.intensity);
  addAttributeIfPresent(Uint8Array, 'classification', 1, data.classification);
  addAttributeIfPresent(Uint16Array, 'objectId', 1, data.objectId);

  (geometry.attributes.indices as BufferAttribute).normalized = true;

  return geometry;
}
