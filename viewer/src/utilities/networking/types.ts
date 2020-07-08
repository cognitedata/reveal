/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat, ModelTransformation } from '../types';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface ModelUrlProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
}

export interface ModelTransformationProvider {
  getModelTransformation(): ModelTransformation;
}

export interface JsonFileProvider {
  getJsonFile(blobUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer>;
}
