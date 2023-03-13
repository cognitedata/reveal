/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import zipWith from 'lodash/zipWith';
import range from 'lodash/range';
import uniqBy from 'lodash/uniqBy';
import head from 'lodash/head';

import {
  CogniteClient,
  CogniteEvent,
  EventFilter,
  FileFilterProps,
  FileInfo,
  HttpError,
  HttpResponseType,
  Metadata
} from '@cognite/sdk';
import { Image360Descriptor, Image360EventDescriptor, Image360Face, Image360FileDescriptor } from '../types';
import { Image360Provider } from '../Image360Provider';
import { Log } from '@reveal/logger';

type Event360Metadata = Event360Filter & Event360TransformationData;

type Event360TransformationData = {
  rotation_angle: string;
  rotation_axis: string;
  translation: string;
};

type Event360Filter = {
  site_id: string;
  site_name: string;
  station_id: string;
  station_name: string;
};

export class Cdf360ImageEventProvider implements Image360Provider<Metadata> {
  private readonly _client: CogniteClient;
  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async get360ImageDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Image360Descriptor[]> {
    const [events, files] = await Promise.all([
      this.listEvents({ metadata: metadataFilter }),
      this.listFiles({ metadata: metadataFilter, uploaded: true })
    ]);

    const image360Descriptors = this.mergeDescriptors(files, events, preMultipliedRotation);

    if (events.length !== image360Descriptors.length) {
      Log.warn(
        `WARNING: There are ${events.length - image360Descriptors.length} rejected 360 images due to invalid data.`,
        '\nThis is typically due to duplicate events or missing files for the images of the cube map.'
      );
    }

    return image360Descriptors;
  }

  public async get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    const fullResFileBuffers = await this.getFileBuffers(this.getFileIds(image360FaceDescriptors), abortSignal);
    return this.createFaces(image360FaceDescriptors, fullResFileBuffers);
  }

  public async getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[]
  ): Promise<Image360Face[]> {
    const lowResFileBuffers = await this.getIconBuffers(this.getFileIds(image360FaceDescriptors));
    return this.createFaces(image360FaceDescriptors, lowResFileBuffers);
  }

  private getFileIds(image360FaceDescriptors: Image360FileDescriptor[]) {
    return image360FaceDescriptors.map(image360FaceDescriptor => {
      return { id: image360FaceDescriptor.fileId };
    });
  }

  private createFaces(image360FaceDescriptors: Image360FileDescriptor[], fileBuffer: ArrayBuffer[]): Image360Face[] {
    return zipWith(image360FaceDescriptors, fileBuffer, (image360FaceDescriptor, fileBuffer) => {
      return {
        face: image360FaceDescriptor.face,
        mimeType: image360FaceDescriptor.mimeType,
        data: fileBuffer
      } as Image360Face;
    });
  }

  private mergeDescriptors(
    files: Map<string, FileInfo[]>,
    events: CogniteEvent[],
    preMultipliedRotation: boolean
  ): Image360Descriptor[] {
    const eventDescriptors = events
      .map(event => event.metadata)
      .filter((metadata): metadata is Event360Metadata => !!metadata)
      .map(metadata => this.parseEventMetadata(metadata, preMultipliedRotation));

    const uniqueEventDescriptors = uniqBy(eventDescriptors, eventDescriptor => eventDescriptor.id);

    return uniqueEventDescriptors
      .map(eventDescriptor => {
        const stationFileInfos = files.get(eventDescriptor.id);

        if (stationFileInfos === undefined || stationFileInfos.length < 6) {
          return { ...eventDescriptor, faceDescriptors: [] };
        }

        const fileInfoSet = this.getNewestFileInfoSet(stationFileInfos);

        const faceDescriptors = fileInfoSet.map(fileInfo => {
          return {
            face: fileInfo.metadata!.face,
            mimeType: fileInfo.mimeType!,
            fileId: fileInfo.id
          } as Image360FileDescriptor;
        });

        return { ...eventDescriptor, faceDescriptors };
      })
      .filter(image360Descriptor => image360Descriptor.faceDescriptors.length === 6);
  }

  private async listEvents(filter: EventFilter): Promise<CogniteEvent[]> {
    const partitions = 10;
    const partitionedRequests = range(1, partitions + 1).flatMap(async index =>
      this._client.events
        .list({ filter, limit: 1000, partition: `${index}/${partitions}` })
        .autoPagingToArray({ limit: Infinity })
    );
    const result = await Promise.all(partitionedRequests);
    return result.flat();
  }

  private async listFiles(filter: FileFilterProps): Promise<Map<string, FileInfo[]>> {
    const map = new Map<string, FileInfo[]>();
    const partitions = 10;
    const partitionedRequest = range(1, partitions + 1).flatMap(async index => {
      const req = { filter, limit: 1000, partition: `${index}/${partitions}` };
      return this._client.files.list(req).autoPagingEach(fileInfo => {
        const id = fileInfo.metadata?.station_id;
        if (!id) return;
        addToMap(id, fileInfo);
      });
    });

    await Promise.all(partitionedRequest);
    return map;

    function addToMap(id: string, fileInfo: FileInfo) {
      const existingEntry = map.get(id);
      if (existingEntry) {
        existingEntry.push(fileInfo);
      } else {
        map.set(id, [fileInfo]);
      }
    }
  }

  private getNewestFileInfoSet(fileInfos: FileInfo[]) {
    if (hasTimestamp()) {
      return getNewestTimestamp();
    }

    return fileInfos;

    function hasTimestamp() {
      return fileInfos[0].metadata?.timestamp !== undefined;
    }

    function getNewestTimestamp() {
      const sets = groupBy(fileInfos, fileInfo => fileInfo.metadata!.timestamp);

      const ordered = orderBy(Object.entries(sets), fileInfoEntry => parseInt(fileInfoEntry[0]), 'desc')
        .map(timeStampSets => timeStampSets[1])
        .filter(fileInfoSets => fileInfoSets.length === 6);

      return head(ordered) ?? [];
    }
  }

  private async getFileBuffers(fileIds: { id: number }[], abortSignal?: AbortSignal) {
    const fileLinks = await this._client.files.getDownloadUrls(fileIds);
    if (abortSignal?.aborted) throw new Error('Request aborted before fetch.');
    return Promise.all(
      fileLinks
        .map(fileLink => fetch(fileLink.downloadUrl, { method: 'GET', signal: abortSignal }))
        .map(async response => (await response).arrayBuffer())
    );
  }

  public async getIconBuffers(fileIds: { id: number }[]): Promise<ArrayBuffer[]> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/icon`;
    const headers = {
      ...this._client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    return Promise.all(
      fileIds.map(async fileId => {
        const response = await this._client.get<ArrayBuffer>(url, {
          params: fileId,
          headers,
          responseType: HttpResponseType.ArrayBuffer
        });

        if (response.status === 200) {
          return response.data;
        } else {
          throw new HttpError(response.status, response.data, response.headers);
        }
      })
    );
  }

  private parseEventMetadata(eventMetadata: Event360Metadata, preMultipliedRotation: boolean): Image360EventDescriptor {
    return {
      collectionId: eventMetadata.site_id,
      collectionLabel: eventMetadata.site_name,
      id: eventMetadata.station_id,
      label: eventMetadata.station_name,
      transform: parseTransform(eventMetadata)
    };

    function parseTransform(transformationData: Event360TransformationData): THREE.Matrix4 {
      const translationComponents = transformationData.translation.split(',').map(parseFloat);
      const milimetersInMeters = 1000;
      const translation = new THREE.Vector3(
        translationComponents[0],
        translationComponents[2],
        -translationComponents[1]
      ).divideScalar(milimetersInMeters);
      const rotationAxisComponents = transformationData.rotation_axis.split(',').map(parseFloat);
      const rotationAxis = new THREE.Vector3(
        rotationAxisComponents[0],
        rotationAxisComponents[2],
        -rotationAxisComponents[1]
      );
      const rotationAngle = THREE.MathUtils.DEG2RAD * parseFloat(transformationData.rotation_angle);
      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

      const translationMatrix = new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z);

      return adjustPreMultipliedTransform(translationMatrix, rotationMatrix);
    }

    function adjustPreMultipliedTransform(translation: THREE.Matrix4, rotation: THREE.Matrix4): THREE.Matrix4 {
      const entityTransform = translation.clone();

      if (!preMultipliedRotation) {
        entityTransform.multiply(rotation.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
      } else {
        entityTransform.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
      }

      return entityTransform;
    }
  }

  public async get360ImageFaces(): Promise<void> {}
}
