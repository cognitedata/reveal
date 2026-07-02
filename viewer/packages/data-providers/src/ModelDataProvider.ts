/*!
 * Copyright 2022 Cognite AS
 */

import type { BinaryFileProvider, JsonFileProvider, SignedFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider extends JsonFileProvider, BinaryFileProvider, SignedFileProvider {
  /**
   * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of JSON file.
   */
  getJsonFile<T = unknown>(baseUrl: string, fileName: string): Promise<T>;
  /**
   * Downloads a binary blob.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of binary file.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
}
