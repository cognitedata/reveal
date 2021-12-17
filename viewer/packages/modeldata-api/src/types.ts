/*!
 * Copyright 2021 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk-core';
export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

/**
 * Provides data for 3D models.
 * @version New since 2.2
 */
export interface ModelDataProvider extends HttpHeadersProvider, JsonFileProvider, BinaryFileProvider {
  /**
   * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of JSON file.
   */
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  /**
   * Downloads a binary blob.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of binary file.
   */
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  RevealCadModel = 'reveal-directory',
  /**
   * @deprecated Use {@link RevealCadModel}
   */
  GltfCadModel = 'gltf-directory',
  AnyFormat = 'all-outputs'
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
