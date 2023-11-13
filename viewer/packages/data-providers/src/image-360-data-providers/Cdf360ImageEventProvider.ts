/*!
 * Copyright 2022 Cognite AS
 */

import zipWith from 'lodash/zipWith';
import chunk from 'lodash/chunk';

import {
  AnnotationModel,
  CogniteClient,
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
  Image360DescriptorProvider,
  Image360Face,
  Image360FileDescriptor,
  ImageAssetLinkAnnotationInfo
} from '../types';
import { Image360Provider } from '../Image360Provider';

export class Cdf360ImageEventProvider implements Image360Provider<Metadata> {
  private readonly _client: CogniteClient;
  private readonly _descriptorProvider: Image360DescriptorProvider<Metadata>;
  constructor(client: CogniteClient, descriptorProvider: Image360DescriptorProvider<Metadata>) {
    this._client = client;
    this._descriptorProvider = descriptorProvider;
  }

  public async get360ImageDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    return this._descriptorProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
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

  public async get360ImageAssets(
    image360FileDescriptors: Image360FileDescriptor[],
    annotationFilter: Image360AnnotationFilterDelegate
  ): Promise<ImageAssetLinkAnnotationInfo[]> {
    const fileIds = image360FileDescriptors.map(desc => desc.fileId);
    const assetListPromises = chunk(fileIds, 1000).map(async idList => {
      const annotationArray = await this.listFileAnnotations({
        annotatedResourceIds: idList.map(id => ({ id })),
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink'
      });

      const assetAnnotations = annotationArray
        .filter(annotation => annotationFilter(annotation))
        .filter(isImageAssetLinkAnnotation);

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

function isImageAssetLinkAnnotation(annotation: AnnotationModel): annotation is ImageAssetLinkAnnotationInfo {
  return isAssetLinkAnnotationData(annotation.data);
}

function isAssetLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const data = annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}
