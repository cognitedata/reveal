/*!
 * Copyright 2022 Cognite AS
 */

import zipWith from 'lodash/zipWith';

import {
  AnnotationData,
  AnnotationFilterProps,
  AnnotationModel,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  CogniteClient,
  CogniteInternalId,
  FileLink,
  IdEither
} from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360AnnotationFilterDelegate,
  Image360DescriptorProvider,
  Image360Face,
  Image360FileDescriptor
} from '../types';
import { Image360Provider } from '../Image360Provider';
import chunk from 'lodash/chunk';
import assert from 'assert';

export class Cdf360ImageProvider<T> implements Image360Provider<T> {
  private readonly _client: CogniteClient;
  private readonly _descriptorProvider: Image360DescriptorProvider<T>;
  constructor(client: CogniteClient, descriptorProvider: Image360DescriptorProvider<T>) {
    this._client = client;
    this._descriptorProvider = descriptorProvider;
  }

  public async get360ImageDescriptors(
    metadataFilter: T,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    return this._descriptorProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
  }

  public async get360ImageAnnotations(descriptors: Image360FileDescriptor[]): Promise<AnnotationModel[]> {
    return [];
    const fileIds = descriptors.map(o => o.fileId);

    const annotationsResult = this._client.annotations.list({
      filter: {
        annotatedResourceType: 'file',
        annotatedResourceIds: fileIds
      }
    });

    const annotationArray = await annotationsResult.autoPagingToArray();

    return annotationArray;
  }

  public async get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    const fullResFileBuffers = await this.getFileBuffers(this.getFileIds(image360FaceDescriptors), abortSignal);
    return this.createFaces(image360FaceDescriptors, fullResFileBuffers);
  }

  public async get360ImageAssets(
    image360FileDescriptors: Image360FileDescriptor[],
    annotationFilter: Image360AnnotationFilterDelegate
  ): Promise<IdEither[]> {
    const fileIds = image360FileDescriptors.map(desc => desc.fileId);
    const assetListPromises = chunk(fileIds, 1000).map(async idList => {
      const annotationArray = await this.listFileAnnotations({
        annotatedResourceIds: idList,
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink'
      });

      const assetIds = annotationArray
        .filter(annotation => annotationFilter(annotation))
        .map(annotation => {
          assert(isAssetLinkAnnotationData(annotation.data), 'Received annotation that was not an assetLink');
          return annotation.data.assetRef;
        });

      return assetIds;
    });

    const assetIds = (await Promise.all(assetListPromises)).flat().filter(isIdEither);

    return assetIds;
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

    const ids = response.data.items.map((a: { id: number }) => a.id);
    return ids;
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
      return image360FaceDescriptor.fileId;
    });
  }

  private async listFileAnnotations(filter: AnnotationFilterProps): Promise<AnnotationModel[]> {
    return this._client.annotations
      .list({
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });
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

  private async getFileBuffers(fileIds: IdEither[], abortSignal?: AbortSignal) {
    const fileLinks = await this.getDownloadUrls(fileIds, abortSignal);
    return Promise.all(
      fileLinks
        .map(fileLink => fetch(fileLink.downloadUrl, { method: 'GET', signal: abortSignal }))
        .map(async response => (await response).arrayBuffer())
    );
  }

  public async getIconBuffers(fileIds: IdEither[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/icon?`;
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
      fileIds
        .map(fileId => `${Object.keys(fileId)[0]}=${Object.values(fileId)[0]}`)
        .map(fileIdQueryParam => fetch(`${url}${fileIdQueryParam}`, options))
        .map(async response => (await response).arrayBuffer())
    );
  }

  private async getDownloadUrls(fileIds: IdEither[], abortSignal?: AbortSignal): Promise<(FileLink & IdEither)[]> {
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
}

function isAssetLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const data = annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}

function isIdEither(assetRef: { id?: number; externalId?: string }): assetRef is IdEither {
  return assetRef.id !== undefined || assetRef.externalId !== undefined;
}
