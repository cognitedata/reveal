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

export interface ModelDataProvider extends HttpHeadersProvider, JsonFileProvider, BinaryFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  RevealCadModel = 'reveal-directory',
  AnyFormat = 'all-outputs'
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
