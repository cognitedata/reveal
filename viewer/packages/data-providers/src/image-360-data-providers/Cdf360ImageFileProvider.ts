/*!
 * Copyright 2025 Cognite AS
 */
import zipWith from 'lodash/zipWith';
import { Image360Face, Image360FileDescriptor, Image360FileProvider } from '../types';
import { CdfImageFileProvider } from './CdfImageFileProvider';
import { CogniteClient, InternalId } from '@cognite/sdk';

export class Cdf360ImageFileProvider implements Image360FileProvider {
  private readonly _imageFileProvider: CdfImageFileProvider;

  constructor(client: CogniteClient) {
    this._imageFileProvider = new CdfImageFileProvider(client);
  }

  public async get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    const fullResFileBuffers = await this._imageFileProvider.getFileBuffers(
      getFileIds(image360FaceDescriptors),
      abortSignal
    );
    return createFacesFromDescriptorsAndBuffers(image360FaceDescriptors, fullResFileBuffers);
  }

  public async getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    const lowResFileBuffers = await this._imageFileProvider.getIconBuffers(
      getFileIds(image360FaceDescriptors),
      abortSignal
    );
    return createFacesFromDescriptorsAndBuffers(image360FaceDescriptors, lowResFileBuffers);
  }
}

export function getFileIds(image360FaceDescriptors: Image360FileDescriptor[]): InternalId[] {
  return image360FaceDescriptors.map(image360FaceDescriptor => {
    return { id: image360FaceDescriptor.fileId };
  });
}

export function createFacesFromDescriptorsAndBuffers(
  image360FaceDescriptors: Image360FileDescriptor[],
  fileBuffer: ArrayBuffer[]
): Image360Face[] {
  return zipWith(image360FaceDescriptors, fileBuffer, (image360FaceDescriptor, fileBuffer) => {
    return {
      face: image360FaceDescriptor.face,
      mimeType: image360FaceDescriptor.mimeType,
      data: fileBuffer
    } as Image360Face;
  });
}
