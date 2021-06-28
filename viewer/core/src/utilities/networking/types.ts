/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { File3dFormat, CameraConfiguration } from '../types';
import { HttpHeadersProvider } from './HttpHeadersProvider';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface LocalModelIdentifier {
  fileName: string;
}

export interface CdfModelIdentifier {
  modelId: number;
  revisionId: number;
}

export interface JsonFileProvider {
  getJsonFile(blobUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface ModelMetadataProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
  getModelCamera(identifier: TModelIdentifier): Promise<CameraConfiguration | undefined>;
  getModelMatrix(identifier: TModelIdentifier): Promise<THREE.Matrix4>;
}

export interface ModelDataClient<TModelIdentifier>
  extends HttpHeadersProvider,
    ModelMetadataProvider<TModelIdentifier>,
    JsonFileProvider,
    BinaryFileProvider {
  getJsonFile(blobUrl: string, fileName: string): Promise<any>;
  getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer>;

  /**
   * Returns an identifier that can be used to identify the application Reveal is used in.
   */
  getApplicationIdentifier(): string;
}
