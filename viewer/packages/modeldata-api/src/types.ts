/*!
 * Copyright 2021 Cognite AS
 */

export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider extends JsonFileProvider, BinaryFileProvider {
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

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  /**
   * V8 models only due to bug for version checks in Reveal <3.0
   */
  RevealCadModel = 'reveal-directory',
  /**
   * Reveal v9 and above (GLTF based output)
   */
  GltfCadModel = 'gltf-directory',
  AnyFormat = 'all-outputs'
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
