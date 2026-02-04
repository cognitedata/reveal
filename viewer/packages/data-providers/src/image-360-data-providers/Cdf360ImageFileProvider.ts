/*!
 * Copyright 2025 Cognite AS
 */
import zipWith from 'lodash/zipWith';
import { Image360Face, Image360FileDescriptor, Image360FileProvider } from '../types';
import { CdfImageFileProvider, FileIdentifier, FileDownloadResult } from './CdfImageFileProvider';
import { CogniteClient } from '@cognite/sdk';

export class Cdf360ImageFileProvider implements Image360FileProvider {
  private readonly _imageFileProvider: CdfImageFileProvider;

  constructor(client: CogniteClient) {
    this._imageFileProvider = new CdfImageFileProvider(client);
  }

  public async get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    // Use getFileBuffersWithMimeType to get the actual mimeType from Content-Type header
    const downloadResults = await this._imageFileProvider.getFileBuffersWithMimeType(
      getFileIdentifiers(image360FaceDescriptors),
      abortSignal
    );
    return createFacesFromDescriptorsAndDownloads(image360FaceDescriptors, downloadResults);
  }

  public async getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    // Use getIconBuffersWithMimeType to get the actual mimeType from Content-Type header
    const downloadResults = await this._imageFileProvider.getIconBuffersWithMimeType(
      getFileIdentifiers(image360FaceDescriptors),
      abortSignal
    );
    return createFacesFromDescriptorsAndDownloads(image360FaceDescriptors, downloadResults);
  }
}

/**
 * Extracts file identifiers from face descriptors.
 */
export function getFileIdentifiers(image360FaceDescriptors: Image360FileDescriptor[]): FileIdentifier[] {
  return image360FaceDescriptors.map(descriptor => {
    if (descriptor.fileId !== undefined) {
      return { id: descriptor.fileId };
    } else if (descriptor.externalId !== undefined) {
      return { externalId: descriptor.externalId };
    } else if (descriptor.instanceId !== undefined) {
      return { instanceId: descriptor.instanceId };
    }
    throw new Error('Invalid Image360FileDescriptor: must have fileId, externalId, or instanceId');
  });
}

export function createFacesFromDescriptorsAndDownloads(
  image360FaceDescriptors: Image360FileDescriptor[],
  downloadResults: FileDownloadResult[]
): Image360Face[] {
  return zipWith(image360FaceDescriptors, downloadResults, (descriptor, download) => {
    return {
      face: descriptor.face,
      mimeType: download.mimeType,
      data: download.data
    } as Image360Face;
  });
}
