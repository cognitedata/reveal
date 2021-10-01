/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CameraConfiguration } from '../../../core/src/utilities/types';

export interface LocalModelIdentifier {
  fileName: string;
}

export interface CdfModelIdentifier {
  modelId: number;
  revisionId: number;
}

export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface ModelMetadataProvider<TModelIdentifier> {
  getModelUrl(identifier: TModelIdentifier): Promise<string>;
  getModelCamera(identifier: TModelIdentifier): Promise<CameraConfiguration | undefined>;
  getModelMatrix(identifier: TModelIdentifier): Promise<THREE.Matrix4>;
}

export interface ModelDataClient<TModelIdentifier> /*HttpHeadersProvider,*/
  extends ModelMetadataProvider<TModelIdentifier>,
    JsonFileProvider,
    BinaryFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;

  /**
   * Returns an identifier that can be used to identify the application Reveal is used in.
   */
  getApplicationIdentifier(): string;
}
