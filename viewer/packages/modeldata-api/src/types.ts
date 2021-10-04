/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { HttpHeaders } from '@cognite/sdk-core';
export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface ModelDataProvider extends HttpHeadersProvider, JsonFileProvider, BinaryFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;

  // TODO 2021-10-04 larsmoa: Move getApplicationIdentifier() to another class - doesn't belong here
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
