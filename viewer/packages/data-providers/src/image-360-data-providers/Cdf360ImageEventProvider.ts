/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import zipWith from 'lodash/zipWith';
import range from 'lodash/range';
import uniqBy from 'lodash/uniqBy';
import chunk from 'lodash/chunk';

import {
  AnnotationModel,
  CogniteClient,
  CogniteEvent,
  EventFilter,
  FileFilterProps,
  FileInfo,
  FileLink,
  IdEither,
  Metadata,
  CogniteInternalId,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  AnnotationData,
  AnnotationFilterProps
} from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360AnnotationFilterDelegate,
  Image360EventDescriptor,
  Image360Face,
  Image360FileDescriptor,
  ImageAssetLinkAnnotation
} from '../types';
import { Image360Provider } from '../Image360Provider';
import { Log } from '@reveal/logger';
import assert from 'assert';

type Event360Metadata = Event360Filter & Event360TransformationData;

type Event360TransformationData = {
  rotation_angle: string;
  rotation_axis: string;
  translation: string;
};

type Event360Filter = {
  site_id: string;
  site_name?: string;
  station_id: string;
  station_name?: string;
};

export class Cdf360ImageEventProvider implements Image360Provider<Metadata> {
  private readonly _client: CogniteClient;
  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async get360ImageDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    const [events, files] = await Promise.all([
      this.listEvents({ metadata: metadataFilter }),
      this.listFiles({ metadata: metadataFilter, uploaded: true })
    ]);

    const image360Descriptors = this.mergeDescriptors(files, events, preMultipliedRotation);
    if (image360Descriptors.length === 0) {
      return Promise.reject(`Error: Could not find any 360 images to load for the site_id "${metadataFilter.site_id}"`);
    }

    if (events.length !== image360Descriptors.length) {
      Log.warn(
        `WARNING: There are ${events.length - image360Descriptors.length} rejected 360 images due to invalid data.`,
        '\nThis is typically due to duplicate events or missing files for the images of the cube map.'
      );
    }

    return image360Descriptors;
  }

  public async get360ImageAnnotations(descriptors: Image360FileDescriptor[]): Promise<AnnotationModel[]> {
    const fileIds = descriptors.map(o => ({ id: o.fileId }));

    return this.listFileAnnotations({
      annotatedResourceType: 'file',
      annotatedResourceIds: fileIds
    });
  }

  public async getFilesByAssetRef(assetRef: IdEither): Promise<CogniteInternalId[]> {
    // TODO: Use SDK properly when support for 'reverselookup' arrives (Håkon, May 11th 2023)
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/annotations/reverselookup`;

    const filterObject: object = {
      data: {
        limit: 1000,
        filter: {
          annotatedResourceType: 'file',
          annotationType: 'images.AssetLink',
          data: {
            assetRef
          }
        }
      }
    };
    const response = await this._client.post(url, filterObject);

    return response.data.items.map((a: { id: number }) => a.id);
  }

  public async get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    const fullResFileBuffers = await this.getFileBuffers(this.getFileIds(image360FaceDescriptors), abortSignal);
    return this.createFaces(image360FaceDescriptors, fullResFileBuffers);
  }

  public async getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    const lowResFileBuffers = await this.getIconBuffers(this.getFileIds(image360FaceDescriptors), abortSignal);
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
  ): Historical360ImageSet[] {
    const eventDescriptors = events
      .map(event => event.metadata)
      .filter((metadata): metadata is Event360Metadata => !!metadata)
      .map(metadata => this.parseEventMetadata(metadata, preMultipliedRotation));

    const uniqueEventDescriptors = uniqBy(eventDescriptors, eventDescriptor => eventDescriptor.id);

    return uniqueEventDescriptors
      .map(eventDescriptor => {
        const stationFileInfos = files.get(eventDescriptor.id);

        if (stationFileInfos === undefined || stationFileInfos.length < 6) {
          return { ...eventDescriptor, imageRevisions: [] };
        }

        const sortedFileInfoSet = this.sortFileInfoSetByNewest(stationFileInfos);

        const imageRevisions = sortedFileInfoSet
          .filter(imageSetInfo => imageSetInfo.length === 6)
          .map(imageSetInfo => {
            const timestamp = imageSetInfo[0].metadata?.timestamp;
            return {
              timestamp: timestamp ? Number(timestamp) : undefined,
              faceDescriptors: imageSetInfo.map(imageInfo => {
                return {
                  face: imageInfo.metadata!.face,
                  mimeType: imageInfo.mimeType!,
                  fileId: imageInfo.id
                } as Image360FileDescriptor;
              })
            };
          });
        return { ...eventDescriptor, imageRevisions };
      })
      .filter(historicalImages => historicalImages.imageRevisions.length > 0);
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

  private sortFileInfoSetByNewest(fileInfos: FileInfo[]): FileInfo[][] {
    if (hasTimestamp()) {
      return sortedByAge();
    }

    return [fileInfos];

    function hasTimestamp() {
      return fileInfos[0].metadata?.timestamp !== undefined;
    }

    function sortedByAge() {
      const sets = groupBy(fileInfos, fileInfo => fileInfo.metadata!.timestamp);

      const ordered = orderBy(Object.entries(sets), fileInfoEntry => parseInt(fileInfoEntry[0]), 'desc')
        .map(timeStampSets => timeStampSets[1])
        .filter(fileInfoSets => fileInfoSets.length === 6);
      return ordered;
    }
  }

  private async getFileBuffers(fileIds: { id: number }[], abortSignal?: AbortSignal) {
    const fileLinks = await this.getDownloadUrls(fileIds, abortSignal);
    return Promise.all(
      fileLinks
        .map(fileLink => fetch(fileLink.downloadUrl, { method: 'GET', signal: abortSignal }))
        .map(async response => (await response).arrayBuffer())
    );
  }

  public async getIconBuffers(fileIds: { id: number }[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/icon?id=`;
    const headers = {
      ...this._client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const options: RequestInit = {
      headers,
      signal: abortSignal,
      method: 'GET'
    };

    return Promise.all(
      fileIds.map(fileId => fetch(url + fileId.id, options)).map(async response => (await response).arrayBuffer())
    );
  }

  private async getDownloadUrls(
    fileIds: { id: number }[],
    abortSignal?: AbortSignal
  ): Promise<(FileLink & IdEither)[]> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/downloadlink`;
    const headers: HeadersInit = {
      ...this._client.getDefaultRequestHeaders(),
      Accept: 'application/json',
      'Content-type': 'application/json'
    };

    const options: RequestInit = {
      headers,
      signal: abortSignal,
      method: 'POST',
      body: JSON.stringify({
        items: fileIds
      })
    };

    const result = await (await fetch(url, options)).json();
    return result.items;
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
      const millimetersInMeters = 1000;
      const translation = new THREE.Vector3(
        translationComponents[0],
        translationComponents[2],
        -translationComponents[1]
      ).divideScalar(millimetersInMeters);
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

  public async get360ImageAssets(
    image360FileDescriptors: Image360FileDescriptor[],
    annotationFilter: Image360AnnotationFilterDelegate
  ): Promise<ImageAssetLinkAnnotation[]> {
    const fileIds = image360FileDescriptors.map(desc => desc.fileId);
    const assetListPromises = chunk(fileIds, 1000).map(async idList => {
      const annotationArray = await this.listFileAnnotations({
        annotatedResourceIds: idList.map(id => ({ id })),
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink'
      });

      const assetAnnotations = annotationArray
        .filter(annotation => annotationFilter(annotation))
        .map(annotation => {
          assert(isAssetLinkAnnotationData(annotation.data), 'Received annotation that was not an assetLink');
          return annotation as ImageAssetLinkAnnotation;
        });

      return assetAnnotations;
    });

    const annotations = (await Promise.all(assetListPromises)).flat();

    return annotations;
  }

  private async listFileAnnotations(filter: AnnotationFilterProps): Promise<AnnotationModel[]> {
    return this._client.annotations
      .list({
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });
  }
}

function isAssetLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const data = annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}
