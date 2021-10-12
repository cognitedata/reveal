/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { HttpHeaders } from '@cognite/sdk-core';

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
  /**
   * Returns an URI that identifies the resource where model geometry and metadata files are stored.
   * @param identifier Identifier of the model
   */
  getModelUri(identifier: TModelIdentifier): Promise<string>;
  getModelCamera(identifier: TModelIdentifier): Promise<CameraConfiguration | undefined>;
  getModelMatrix(identifier: TModelIdentifier): Promise<THREE.Matrix4>;
}

export interface ModelDataClient extends HttpHeadersProvider, JsonFileProvider, BinaryFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;

  /**
   * Returns an identifier that can be used to identify the application Reveal is used in.
   */
  getApplicationIdentifier(): string;
}

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  RevealCadModel = 'reveal-directory',
  AnyFormat = 'all-outputs'
}

/**
 * Represents a camera configuration, consisting of a camera position and target.
 */
export type CameraConfiguration = {
  readonly position: THREE.Vector3;
  readonly target: THREE.Vector3;
};

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
