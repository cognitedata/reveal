/*!
 * Copyright 2020 Cognite AS
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

export interface ModelUrlProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
}

export interface ModelTransformationProvider<TModelIdentifier> {
  getModelMatrix(identifier: TModelIdentifier): Promise<THREE.Matrix4>;
}

export interface ModelCameraConfigurationProvider<TModelIdentifier> {
  getModelCamera(identifier: TModelIdentifier): Promise<CameraConfiguration | undefined>;
}

export interface JsonFileProvider {
  getJsonFile(blobUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface ModelDataClient<TModelIdentifier>
  extends ModelUrlProvider<TModelIdentifier>,
    ModelTransformationProvider<TModelIdentifier>,
    ModelCameraConfigurationProvider<TModelIdentifier>,
    JsonFileProvider,
    BinaryFileProvider,
    HttpHeadersProvider {
  /**
   * Returns an identifier that can be used to identify the application Reveal is used in.
   */
  getApplicationIdentifier(): string;
}
